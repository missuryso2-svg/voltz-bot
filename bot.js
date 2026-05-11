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
const CHANNEL_APROVACOES = '📋・aprovações';

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

        `1️⃣ Leia as regras do servidor.\n\n` +

        `2️⃣ Clique no botão "Se Inscrever".\n\n` +

        `3️⃣ O bot abrirá um ticket privado.\n\n` +

        `4️⃣ Responda as perguntas corretamente.\n\n` +

        `5️⃣ Aguarde a avaliação dos recrutadores.\n\n` +

        `6️⃣ Se aprovado, você recebe o cargo @🎯 Tryout.\n\n` +

        `7️⃣ Jogadores Tryout serão testados em partidas ranqueadas.\n\n` +

        `8️⃣ Sendo aprovado no teste final você vira oficialmente um player da VOLTZ.`
      );

  } else {

    return new EmbedBuilder()
      .setColor('Red')
      .setTitle('❌ RECRUTAMENTO FECHADO')
      .setDescription(
        `No momento o recrutamento está fechado.\n\n` +

        `📢 Fique atento ao canal #📢・anuncios para saber:\n\n` +

        `• Próximas datas\n` +
        `• Quantidade de vagas\n` +
        `• Novos recrutamentos`
      );

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

  await atualizarPainel(guild);

});

// INTERAÇÕES
client.on(Events.InteractionCreate, async interaction => {

  // BOTÕES
  if (interaction.isButton()) {

    // TICKET
    if (interaction.customId === 'ticket') {

      if (!recrutamentoAberto) {

        return interaction.reply({
          content: '❌ Recrutamento fechado.',
          ephemeral: true
        });

      }

      const existente = interaction.guild.channels.cache.find(
        c => c.name === `ticket-${interaction.user.username.toLowerCase()}`
      );

      if (existente) {

        return interaction.reply({
          content: `❌ Você já possui um ticket: ${existente}`,
          ephemeral: true
        });

      }

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
          `Responda:\n\n` +

          `1️⃣ Nome/Nick\n` +
          `2️⃣ Idade\n` +
          `3️⃣ Plataforma\n` +
          `4️⃣ Rank Atual\n` +
          `5️⃣ Experiência Competitiva\n` +
          `6️⃣ Horários Disponíveis\n` +
          `7️⃣ Por que deseja entrar para a VOLTZ?`
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

  // SLASH
  if (!interaction.isChatInputCommand()) return;

  const admin = interaction.member.permissions.has(
    PermissionsBitField.Flags.Administrator
  );

  // PING
  if (interaction.commandName === 'ping') {

    return interaction.reply('🏓 Pong!');

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
      '🔒 Canal fechado.'
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

    return interaction.reply(
      '🔓 Canal aberto.'
    );

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
      `🔨 ${user.tag} foi banido.`
    );

  }

  // KICK
  if (interaction.commandName === 'kick') {

    if (!admin) return;

    const user = interaction.options.getUser('usuario');
    const member = await interaction.guild.members.fetch(user.id);

    await member.kick();

    return interaction.reply(
      `👢 ${user.tag} foi expulso.`
    );

  }

  // MUTE
  if (interaction.commandName === 'mute') {

    if (!admin) return;

    const user = interaction.options.getUser('usuario');

    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(60 * 60 * 1000);

    return interaction.reply(
      `🔇 ${user.tag} mutado por 1 hora.`
    );

  }

  // UNMUTE
  if (interaction.commandName === 'unmute') {

    if (!admin) return;

    const user = interaction.options.getUser('usuario');

    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(null);

    return interaction.reply(
      `🔊 ${user.tag} desmutado.`
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
        '❌ Cargo não encontrado.'
      );

    }

    await member.roles.add(role);

    // RESUMO APROVAÇÃO
    const canalAprovacoes = getChannel(
      interaction.guild,
      CHANNEL_APROVACOES
    );

    if (canalAprovacoes) {

      const ticket = interaction.guild.channels.cache.find(
        c =>
          c.name === `ticket-${user.username.toLowerCase()}`
      );

      let resumo = 'Sem respostas encontradas.';

      if (ticket) {

        const mensagens = await ticket.messages.fetch({
          limit: 20
        });

        const respostas = mensagens
          .filter(m => !m.author.bot)
          .map(m => m.content)
          .reverse()
          .join('\n\n');

        resumo = respostas || resumo;

      }

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ NOVO TRYOUT APROVADO')
        .setDescription(
          `👤 Usuário: ${user}\n\n` +

          `📋 Resumo do Perfil:\n\n` +

          `${resumo}`
        )
        .setFooter({
          text: 'VOLTZ ESPORTS'
        });

      await canalAprovacoes.send({
        embeds: [embed]
      });

    }

    return interaction.reply(
      `🎯 ${user.tag} aprovado como Tryout.`
    );

  }

  // RECRUTAMENTO
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

  // MENSAGEM
  if (interaction.commandName === 'mensagem') {

    if (!admin) return;

    const texto = interaction.options.getString('texto');

    const embed = new EmbedBuilder()
      .setColor('Gold')
      .setDescription(texto);

    return interaction.reply({
      embeds: [embed]
    });

  }

});

// LOGIN
client.login(TOKEN);