require('dotenv').config();

console.log("🚀 VOLTZ BOT INICIANDO...");

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const PREFIX = '+';

// CONFIG
const CHANNEL_VALIDACAO = 'validação';
const CHANNEL_RECRUTAMENTO = 'inscricao';
const CHANNEL_REGRAS = '📜・regras';
const CATEGORY_TICKET = 'tickets';

const ROLE_MEMBER = '👤 Membro';
const ROLE_AVALIACAO = '🧪 Em Avaliação';
const ROLE_TRYOUT = '🎯 Tryout';

let recrutamentoAberto = true;

function getChannel(guild, name) {
  return guild.channels.cache.find(c =>
    c.name.toLowerCase().includes(name.toLowerCase())
  );
}

// EMBED
function embedRecrutamento() {
  return recrutamentoAberto
    ? new EmbedBuilder()
        .setColor('Green')
        .setTitle('🎯 RECRUTAMENTO ABERTO')
        .setDescription('Responda as perguntas → avaliação → Tryout → possível entrada na VOLTZ')
    : new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ RECRUTAMENTO FECHADO')
        .setDescription('Fique atento ao canal #📢・anuncios');
}

// READY
client.once(Events.ClientReady, async () => {
  console.log(`⚡ ONLINE: ${client.user.tag}`);

  const guild = client.guilds.cache.first();

  const canalVal = getChannel(guild, CHANNEL_VALIDACAO);
  const canalRec = getChannel(guild, CHANNEL_RECRUTAMENTO);

  if (canalVal) {
    canalVal.send({
      embeds: [new EmbedBuilder().setTitle('👋 Bem-vindo').setDescription('Clique para entrar')],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('entrar').setLabel('Entrar').setStyle(ButtonStyle.Success)
        )
      ]
    });
  }

  if (canalRec) {
    canalRec.send({
      embeds: [embedRecrutamento()],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ticket')
            .setLabel('Se inscrever')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!recrutamentoAberto)
        )
      ]
    });
  }
});

// BOTÕES
client.on(Events.InteractionCreate, async i => {

  if (i.isButton()) {

    if (i.customId === 'entrar') {
      const role = i.guild.roles.cache.find(r => r.name === ROLE_MEMBER);
      if (role) await i.member.roles.add(role);
      return i.reply({ content: '✅ Liberado!', ephemeral: true });
    }

    if (i.customId === 'ticket') {
      if (!recrutamentoAberto) {
        return i.reply({ content: '❌ Recrutamento fechado', ephemeral: true });
      }

      const canal = await i.guild.channels.create({
        name: `ticket-${i.user.username}`,
        type: ChannelType.GuildText
      });

      return i.reply({ content: `🎟️ ${canal}`, ephemeral: true });
    }
  }

  // SLASH
  if (!i.isChatInputCommand()) return;

  const admin = i.member.permissions.has(PermissionsBitField.Flags.Administrator);

  if (i.commandName === 'ping') return i.reply('🏓 Pong!');

  if (i.commandName === 'recrutamento') {
    if (!admin) return;
    recrutamentoAberto = true;
    return i.reply('✅ Aberto');
  }

  if (i.commandName === 'fechar_recrutamento') {
    if (!admin) return;
    recrutamentoAberto = false;
    return i.reply('❌ Fechado');
  }

});

// PREFIX
client.on('messageCreate', async m => {
  if (!m.content.startsWith(PREFIX)) return;

  const cmd = m.content.slice(1).split(' ')[0];
  const admin = m.member.permissions.has(PermissionsBitField.Flags.Administrator);

  if (cmd === 'recrutamento' && admin) {
    recrutamentoAberto = true;
    m.reply('✅ Aberto');
  }

  if (cmd === 'fechar_recrutamento' && admin) {
    recrutamentoAberto = false;
    m.reply('❌ Fechado');
  }
});

client.login(TOKEN);