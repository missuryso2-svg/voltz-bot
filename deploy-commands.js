const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // ID do bot
const GUILD_ID = process.env.GUILD_ID;   // ID do servidor

// 📦 COMANDOS QUE EXISTEM NO BOT
const commands = [

  // 🏓 TESTE
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifica se o bot está online'),

  // 🔒 FECHAR CANAL
  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Fechar o canal'),

  // 🔓 ABRIR CANAL
  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Abrir o canal')

].map(cmd => cmd.toJSON());

// 🚀 DEPLOY
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('🔄 Atualizando comandos...');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ Comandos registrados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
})();