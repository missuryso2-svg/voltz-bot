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

const ROLE_MEMBER = '👤 Membro';

let recrutamentoAberto = true;

// BUSCAR CANAL
function getChannel(guild, name) {
  return guild.channels.cache.find(c =>
    c.name.toLowerCase().includes(name.toLowerCase())
  );
}

// EMBED RECRUTAMENTO
function embedRecrutamento() {
  return recrutamentoAberto
    ? new EmbedBuilder()
        .setColor('Green')
        .setTitle('🎯 RECRUTAMENTO ABERTO')
        .setDescription(`Responda o bot → Avaliação → Tryout → VOLTZ`)
    : new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ RECRUTAMENTO FECHADO')
        .setDescription(`Fique atento ao canal 📢・anuncios`);
}

// READY
client.once(Events.ClientReady, async () => {
  console.log(`⚡ ONLINE: ${client.user.tag}`);

  const guild = client.guilds.cache.first();

  const canalVal = getChannel(guild, CHANNEL_VALIDACAO);
  const canalRec = getChannel(guild, CHANNEL_RECRUTAMENTO);

  if (canalVal) {
    canalVal.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Green')
          .setTitle('👋 Bem-vindo')
          .setDescription('Clique para entrar')
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('entrar')
            .setLabel('Entrar')
            .setStyle(ButtonStyle.Success)
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

// INTERAÇÕES
client.on(Events.InteractionCreate, async i => {

  if (i.isButton()) {

    if (i.customId === 'entrar') {
      const role = i.guild.roles.cache.find(r => r.name === ROLE_MEMBER);
      if (role) await i.member.roles.add(role);
      return i.reply({ content: '✅ Liberado!', ephemeral: true });
    }

    if (i.customId === 'ticket') {
      if (!recrutamentoAberto) {
        return i.reply({ content: '❌ Recrutamento fechado.', ephemeral: true });
      }

      const canal = await i.guild.channels.create({
        name: `ticket-${i.user.username}`,
        type: ChannelType.GuildText
      });

      return i.reply({ content: `🎟️ Ticket: ${canal}`, ephemeral: true });
    }
  }

  if (!i.isChatInputCommand()) return;

  const admin = i.member.permissions.has(PermissionsBitField.Flags.Administrator);

  // PING
  if (i.commandName === 'ping') {
    return i.reply('🏓 Pong!');
  }

  // MENSAGEM
  if (i.commandName === 'mensagem') {
    if (!admin) return i.reply({ content: '❌ Sem permissão', ephemeral: true });

    const texto = i.options.getString('texto');

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setDescription(texto);

    return i.reply({ embeds: [embed] });
  }

  // LIMPAR
  if (i.commandName === 'limpar') {
    if (!admin) return i.reply({ content: '❌ Sem permissão', ephemeral: true });

    const qtd = i.options.getInteger('quantidade');
    await i.channel.bulkDelete(qtd, true);

    return i.reply({ content: `🧹 ${qtd} mensagens apagadas`, ephemeral: true });
  }

  // BAN
  if (i.commandName === 'ban') {
    if (!admin) return;

    const user = i.options.getUser('usuario');
    const member = await i.guild.members.fetch(user.id);

    await member.ban();
    return i.reply(`🔨 ${user.tag} banido`);
  }

  // KICK
  if (i.commandName === 'kick') {
    if (!admin) return;

    const user = i.options.getUser('usuario');
    const member = await i.guild.members.fetch(user.id);

    await member.kick();
    return i.reply(`👢 ${user.tag} expulso`);
  }

  // LOCK
  if (i.commandName === 'lock') {
    if (!admin) return;

    await i.channel.permissionOverwrites.edit(i.guild.roles.everyone, {
      SendMessages: false
    });

    return i.reply('🔒 Canal fechado');
  }

  // UNLOCK
  if (i.commandName === 'unlock') {
    if (!admin) return;

    await i.channel.permissionOverwrites.edit(i.guild.roles.everyone, {
      SendMessages: true
    });

    return i.reply('🔓 Canal aberto');
  }

  // RECRUTAMENTO
  if (i.commandName === 'recrutamento') {
    if (!admin) return;
    recrutamentoAberto = true;
    return i.reply('✅ Recrutamento aberto!');
  }

  if (i.commandName === 'fechar_recrutamento') {
    if (!admin) return;
    recrutamentoAberto = false;
    return i.reply('❌ Recrutamento fechado!');
  }

});

// PREFIX "+"
client.on('messageCreate', async msg => {

  if (!msg.content.startsWith(PREFIX)) return;

  const args = msg.content.slice(1).split(' ');
  const cmd = args.shift().toLowerCase();
  const admin = msg.member.permissions.has(PermissionsBitField.Flags.Administrator);

  if (cmd === 'mensagem' && admin) {
    const texto = args.join(' ');
    msg.delete();

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setDescription(texto);

    msg.channel.send({ embeds: [embed] });
  }

});

client.login(TOKEN);