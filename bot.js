require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
  PermissionFlagsBits
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
const CHANNEL_ANUNCIOS = '📢・anuncios';

const ROLE_MEMBER = '👤 Membro';
const ROLE_TRYOUT = '🎯 Tryout';

let recrutamentoAberto = true;
let mensagemRecrutamento = null;

// BUSCAR CANAL
function getChannel(guild, name) {
  return guild.channels.cache.find(c =>
    c.name.toLowerCase().includes(name.toLowerCase())
  );
}

// EMBED RECRUTAMENTO
function embedRecrutamento() {

  if (recrutamentoAberto) {

    return new EmbedBuilder()
      .setColor('Green')
      .setTitle('🎯 RECRUTAMENTO VOLTZ ABERTO')
      .setDescription(
        `O recrutamento oficial da VOLTZ está aberto!\n\n` +

        `📌 COMO FUNCIONA O RECRUTAMENTO:\n\n` +

        `1️⃣ Leia todas as regras do servidor antes de iniciar.\n\n` +

        `2️⃣ Clique no botão "Se Inscrever" abaixo.\n\n` +

        `3️⃣ O bot abrirá um ticket privado.\n\n` +

        `4️⃣ Dentro do ticket você responderá as perguntas do recrutamento.\n\n` +

        `5️⃣ Após responder tudo, aguarde a validação dos recrutadores.\n\n` +

        `6️⃣ Caso seja aprovado você receberá o cargo @🎯 Tryout.\n\n` +

        `7️⃣ Jogadores Tryout serão avaliados em partidas ranqueadas.\n\n` +

        `8️⃣ Sendo aprovado no teste final você se tornará oficialmente um player da VOLTZ.\n\n` +

        `⚠️ Responda tudo corretamente e aguarde pacientemente a equipe.`
      )
      .setFooter({
        text: 'VOLTZ ESPORTS'
      });

  } else {

    return new EmbedBuilder()
      .setColor('Red')
      .setTitle('❌ RECRUTAMENTO FECHADO')
      .setDescription(
        `No momento o recrutamento da VOLTZ está fechado.\n\n` +

        `📢 Caso tenha interesse em entrar na organização, fique atento ao canal #📢・anuncios.\n\n` +

        `Lá serão divulgadas:\n` +
        `• Próximas datas\n` +
        `• Quantidade de vagas\n` +
        `• Requisitos\n\n` +

        `Acompanhe os anúncios para não perder a próxima oportunidade.`
      )
      .setFooter({
        text: 'VOLTZ ESPORTS'
      });

  }
}

// BOTÃO
function recrutamentoButtons() {

  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket')
        .setLabel('🎯 Se Inscrever')
        .setStyle(ButtonStyle.Success)
        .setDisabled(!recrutamentoAberto)
    )
  ];

}

// ATUALIZAR PAINEL
async function atualizarPainel(guild) {

  const canal = getChannel(guild, CHANNEL_RECRUTAMENTO);

  if (!canal) return;

  if (mensagemRecrutamento) {

    try {

      await mensagemRecrutamento.edit({
        embeds: [embedRecrutamento()],
        components: recrutamentoButtons()
      });

      return;

    } catch (e) {}

  }

  mensagemRecrutamento = await canal.send({
    embeds: [embedRecrutamento()],
    components: recrutamentoButtons()
  });

}

// READY
client.once(Events.ClientReady, async () => {

  console.log(`✅ ONLINE: ${client.user.tag}`);

  const guild = client.guilds.cache.first();

  // PAINEL VALIDAÇÃO
  const canalVal = getChannel(guild, CHANNEL_VALIDACAO);

  if (canalVal) {

    await canalVal.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Green')
          .setTitle('👋 Bem-vindo à VOLTZ')
          .setDescription(
            'Clique no botão abaixo para liberar acesso ao servidor.'
          )
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

  // PAINEL RECRUTAMENTO
  await atualizarPainel(guild);

});

// INTERAÇÕES
client.on(Events.InteractionCreate, async interaction => {

  // BOTÕES
  if (interaction.isButton()) {

    // ENTRAR
    if (interaction.customId === 'entrar') {

      const role = interaction.guild.roles.cache.find(
        r => r.name === ROLE_MEMBER
      );

      if (role) {
        await interaction.member.roles.add(role);
      }

      return interaction.reply({
        content: '✅ Acesso liberado!',
        ephemeral: true
      });

    }

    // RECRUTAMENTO
    if (interaction.customId === 'ticket') {

      if (!recrutamentoAberto) {

        return interaction.reply({
          content: '❌ O recrutamento está fechado.',
          ephemeral: true
        });

      }

      // VERIFICAR TICKET
      const existente = interaction.guild.channels.cache.find(
        c => c.name === `ticket-${interaction.user.username.toLowerCase()}`
      );

      if (existente) {

        return interaction.reply({
          content: `❌ Você já possui um ticket aberto: ${existente}`,
          ephemeral: true
        });

      }

      // CRIAR TICKET
      const canal = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username.toLowerCase()}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('📋 Questionário de Recrutamento')
        .setDescription(
          `Olá ${interaction.user}!\n\n` +

          `Responda as perguntas abaixo:\n\n` +

          `1️⃣ Nome/Nick\n` +
          `2️⃣ Idade\n` +
          `3️⃣ Plataforma\n` +
          `4️⃣ Rank Atual\n` +
          `5️⃣ Experiência Competitiva\n` +
          `6️⃣ Horários Disponíveis\n` +
          `7️⃣ Por que deseja entrar para a VOLTZ?\n\n` +

          `Após responder tudo aguarde os recrutadores.`
        );

      await canal.send({
        content: `${interaction.user}`,
        embeds: [embed]
      });

      return interaction.reply({
        content: `✅ Ticket criado: ${canal}`,
        ephemeral: true
      });

    }

  }

  // SLASH COMMANDS
  if (!interaction.isChatInputCommand()) return;

  const admin = interaction.member.permissions.has(
    PermissionsBitField.Flags.Administrator
  );

  // PING
  if (interaction.commandName === 'ping') {

    return interaction.reply('🏓 Pong!');

  }

  // LIMPAR
  if (interaction.commandName === 'limpar') {

    if (!admin) return;

    const qtd = interaction.options.getInteger('quantidade');

    await interaction.channel.bulkDelete(qtd, true);

    return interaction.reply({
      content: `🧹 ${qtd} mensagens apagadas.`,
      ephemeral: true
    });

  }

  // LOCK
  if (interaction.commandName === 'lock') {

    if (!admin) return;

    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: false
      }
    );

    return interaction.reply(
      '🔒 Canal fechado. Apenas administradores podem escrever.'
    );

  }

  // UNLOCK
  if (interaction.commandName === 'unlock') {

    if (!admin) return;

    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: true
      }
    );

    return interaction.reply('🔓 Canal reaberto.');

  }

  // BAN
  if (interaction.commandName === 'ban') {

    if (!admin) return;

    const user = interaction.options.getUser('usuario');
    const motivo =
      interaction.options.getString('motivo') || 'Sem motivo';

    const member = await interaction.guild.members.fetch(user.id);

    await member.ban({
      reason: motivo
    });

    return interaction.reply(
      `🔨 ${user.tag} foi banido.\nMotivo: ${motivo}`
    );

  }

  // KICK
  if (interaction.commandName === 'kick') {

    if (!admin) return;

    const user = interaction.options.getUser('usuario');
    const motivo =
      interaction.options.getString('motivo') || 'Sem motivo';

    const member = await interaction.guild.members.fetch(user.id);

    await member.kick(motivo);

    return interaction.reply(
      `👢 ${user.tag} foi expulso.\nMotivo: ${motivo}`
    );

  }

  // MUTE
  if (interaction.commandName === 'mute') {

    if (!admin) return;

    const user = interaction.options.getUser('usuario');

    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(60 * 60 * 1000);

    return interaction.reply(
      `🔇 ${user.tag} foi mutado por 1 hora.`
    );

  }

  // UNMUTE
  if (interaction.commandName === 'unmute') {

    if (!admin) return;

    const user = interaction.options.getUser('usuario');

    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(null);

    return interaction.reply(
      `🔊 ${user.tag} foi desmutado.`
    );

  }

  // TRYOUT
  if (interaction.commandName === 'tryout') {

    if (!admin) return;

    const user = interaction.options.getUser('usuario');

    const member = await interaction.guild.members.fetch(user.id);

    const role = interaction.guild.roles.cache.find(
      r => r.name === ROLE_TRYOUT
    );

    if (!role) {

      return interaction.reply(
        '❌ Cargo @🎯 Tryout não encontrado.'
      );

    }

    await member.roles.add(role);

    return interaction.reply(
      `🎯 ${user.tag} agora é um Tryout da VOLTZ.`
    );

  }

  // ABRIR RECRUTAMENTO
  if (interaction.commandName === 'recrutamento') {

    if (!admin) return;

    recrutamentoAberto = true;

    await atualizarPainel(interaction.guild);

    return interaction.reply(
      '✅ Recrutamento aberto.'
    );

  }

  // FECHAR RECRUTAMENTO
  if (interaction.commandName === 'fechar_recrutamento') {

    if (!admin) return;

    recrutamentoAberto = false;

    await atualizarPainel(interaction.guild);

    return interaction.reply(
      '❌ Recrutamento fechado.'
    );

  }

});

// PREFIX +
client.on('messageCreate', async msg => {

  if (!msg.content.startsWith(PREFIX)) return;

  const args = msg.content.slice(1).split(' ');
  const cmd = args.shift().toLowerCase();

  const admin = msg.member.permissions.has(
    PermissionsBitField.Flags.Administrator
  );

  // MENSAGEM
  if (cmd === 'mensagem' && admin) {

    const texto = args.join(' ');

    await msg.delete();

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setDescription(texto);

    msg.channel.send({
      embeds: [embed]
    });

  }

});

client.login(TOKEN);