// index.js
const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { token, clientId, guildId } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ====================
// Commands definieren
// ====================
const commands = [
  // /embed Command
  new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Sendet ein Embed mit optionalem Banner und Zeilenumbrüchen')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text für das Embed, "|" für neue Zeilen')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('banner')
        .setDescription('Optionaler Banner-Link (großes Bild)')
        .setRequired(false)
    ),
  // /rules Command
  new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Zeigt die Serverregeln von HOLZ MARKET')
].map(c => c.toJSON());

// ====================
// REST-Client für Commands
// ====================
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  // --------------------
  // Alte Commands löschen
  // --------------------
  try {
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: [] } // löscht alle alten Slash-Commands
    );
    console.log('Alle alten Commands gelöscht!');
  } catch (error) {
    console.error('Fehler beim Löschen der Commands:', error);
  }

  // --------------------
  // Neue Commands registrieren
  // --------------------
  try {
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log('Slash commands registered!');
  } catch (error) {
    console.error('Fehler beim Registrieren der Commands:', error);
  }
})();

// ====================
// Bot ist bereit
// ====================
client.once('ready', () => {
  console.log(`${client.user.tag} ist online!`);
});

// ====================
// Slash-Commands ausführen
// ====================
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  // ---------- /embed ----------
  if (interaction.commandName === 'embed') {
    let text = interaction.options.getString('text');
    const banner = interaction.options.getString('banner');

    // "|" → Zeilenumbruch
    text = text.replace(/\|/g, '\n');

    const embed = new EmbedBuilder()
      .setTitle('Holz Market')   // Titel oben
      .setDescription(text)      // Dein Text
      .setColor(0x00FF00)        // Grün
      .setImage(banner || 'https://cdn.discordapp.com/attachments/1145757765868994580/1486057054337634324/ChatGPT_Image_24._Marz_2026_15_02_13.png'); // Banner unten

    await interaction.reply({ embeds: [embed] });
  }

  // ---------- /rules ----------
  if (interaction.commandName === 'rules') {
    const embed = new EmbedBuilder()
      .setTitle('📜 HOLZ MARKET – SERVER RULES 📜')
      .setDescription(
`To keep this server safe and enjoyable for everyone, all members must follow these rules:

**1. Respect Everyone**  
Treat all members with respect. No harassment, hate speech, racism, sexism, or toxic behavior.

**2. No Scamming**  
Scamming is strictly forbidden. Any attempt to scam will result in an immediate ban.

**3. Trade at Your Own Risk**  
HOLZ MARKET provides a platform for trading, but we are not responsible for deals between users. Always be careful and use trusted methods.

**4. No Impersonation**  
Do not pretend to be another member, staff, or a trusted seller.

**5. Use the Correct Channels**  
Post your offers, requests, and services in the appropriate channels only.

**6. No Spam or Advertising**  
Do not spam messages, links, or promote other servers/services without permission.

**7. No Illegal Content**  
Sharing illegal content or engaging in illegal activities is strictly prohibited.

**8. Follow Discord Terms of Service**  
All users must follow Discord’s official Terms of Service and Community Guidelines.

**9. Staff Decisions**  
Respect staff decisions at all times. If you have an issue, contact staff privately.

**10. Keep It GTA Related**  
This server is focused on GTA Online trading. Stay on topic.

🚨 **Breaking these rules may result in warnings, mutes, or permanent bans.**

💬 **Stay safe, trade smart, and enjoy your time at HOLZ MARKET!**`
      )
      .setColor(0xFFAA00) // Orange/Gold
      .setFooter({ text: 'HOLZ MARKET • Follow the rules!' });

    await interaction.reply({ embeds: [embed] });
  }
});

// ====================
// Bot einloggen
// ====================
client.login(token);