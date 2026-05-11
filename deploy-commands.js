require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [

  // 🏓
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifica se o bot está online'),

  // 📢
  new SlashCommandBuilder()
    .setName('mensagem')
    .setDescription('Enviar mensagem pelo bot')
    .addStringOption(opt =>
      opt.setName('texto')
        .setDescription('Mensagem')
        .setRequired(true)
    ),

  // 🧹
  new SlashCommandBuilder()
    .setName('limpar')
    .setDescription('Apagar mensagens')
    .addIntegerOption(opt =>
      opt.setName('quantidade')
        .setDescription('Quantidade')
        .setRequired(true)
    ),

  // 🔒
  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Fechar canal'),

  // 🔓
  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Abrir canal'),

  // 🔨
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banir usuário')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuário')
        .setRequired(true)
    ),

  // 👢
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsar usuário')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuário')
        .setRequired(true)
    ),

  // 🎯
  new SlashCommandBuilder()
    .setName('recrutamento')
    .setDescription('Abrir recrutamento'),

  new SlashCommandBuilder()
    .setName('fechar_recrutamento')
    .setDescription('Fechar recrutamento')

].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('🔄 Atualizando comandos...');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ TODOS os comandos registrados!');
  } catch (err) {
    console.error('❌ ERRO:', err);
  }
})();