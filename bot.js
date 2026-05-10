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

// 📌 CONFIG
const CHANNEL_VALIDACAO = 'validação';
const CHANNEL_RECRUTAMENTO = 'inscricao';
const CHANNEL_REGRAS = '📜・regras';
const CATEGORY_TICKET = 'tickets';

// 🎭 CARGOS
const ROLE_MEMBER = '👤 Membro';
const ROLE_AVALIACAO = '🧪 Em Avaliação';
const ROLE_TRYOUT = '🎯 Tryout';

// 🔄 ESTADO DO RECRUTAMENTO
let recrutamentoAberto = true;

// 📋 PERGUNTAS
const perguntas = [
  "Qual seu nome?",
  "Qual seu nick in game?",
  "Qual sua idade?",
  "Qual sua patente?",
  "Quantas horas de jogo você tem?",
  "Qual turno você joga?"
];

// 🔍 buscar canal
function getChannel(guild, name) {
  return guild.channels.cache.find(c =>
    c.name.toLowerCase().includes(name.toLowerCase())
  );
}

// 🎨 EMBED RECRUTAMENTO
function getEmbedRecrutamento() {
  if (recrutamentoAberto) {
    return new EmbedBuilder()
      .setColor('Green')
      .setTitle('🎯 RECRUTAMENTO ABERTO — VOLTZ')
      .setDescription(
`O recrutamento da VOLTZ está aberto.

📌 **Como funciona:**
Após ler as regras, o candidato deverá responder as perguntas do bot.

🧠 Depois disso:
• Seu perfil será analisado pela equipe  
• Caso aprovado → receberá o cargo **🎯 Tryout**  
• Será testado em partidas ranqueadas  
• Se aprovado → entra oficialmente para a VOLTZ  

⚡ **Leve o processo com seriedade.**
Clique no botão abaixo para iniciar sua inscrição.`
      );
  } else {
    return new EmbedBuilder()
      .setColor('Red')
      .setTitle('❌ RECRUTAMENTO FECHADO')
      .setDescription(
`No momento o recrutamento está fechado.

📢 Fique atento ao canal **#📢・anuncios** para saber quando abrirá novamente e quantas vagas estarão disponíveis.

⚡ A VOLTZ busca sempre jogadores comprometidos.`
      );
  }
}

// 🚀 READY
client.once(Events.ClientReady, async () => {
  console.log(`⚡ ONLINE: ${client.user.tag}`);

  const guild = client.guilds.cache.first();
  if (!guild) return;

  // 📢 VALIDAÇÃO
  const canalValidacao = getChannel(guild, CHANNEL_VALIDACAO);

  const btnEntrar = new ButtonBuilder()
    .setCustomId('entrar')
    .setLabel('Entrar no servidor')
    .setStyle(ButtonStyle.Success);

  if (canalValidacao) {
    canalValidacao.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Green')
          .setTitle('👋 Bem-vindo à VOLTZ')
          .setDescription('Clique abaixo para liberar seu acesso')
      ],
      components: [new ActionRowBuilder().addComponents(btnEntrar)]
    });
  }

  // 🎯 RECRUTAMENTO
  const canalRecruit = getChannel(guild, CHANNEL_RECRUTAMENTO);

  const btn = new ButtonBuilder()
    .setCustomId('abrir_ticket')
    .setLabel('Se inscrever')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(!recrutamentoAberto);

  if (canalRecruit) {
    canalRecruit.send({
      embeds: [getEmbedRecrutamento()],
      components: [new ActionRowBuilder().addComponents(btn)]
    });
  }

  // 📜 REGRAS
  const canalRegras = getChannel(guild, CHANNEL_REGRAS);

  if (canalRegras) {
    canalRegras.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle('📜 VOLTZ ESPORTS — REGRAS')
          .setDescription('Ambiente competitivo, organizado e respeitoso.')
      ]
    });
  }
});

// 🎮 INTERAÇÕES
client.on(Events.InteractionCreate, async interaction => {

  if (interaction.isButton()) {

    // ENTRAR
    if (interaction.customId === 'entrar') {
      const role = interaction.guild.roles.cache.find(r => r.name === ROLE_MEMBER);
      if (role) await interaction.member.roles.add(role);

      return interaction.reply({ content: '✅ Acesso liberado!', ephemeral: true });
    }

    // TICKET
    if (interaction.customId === 'abrir_ticket') {

      if (!recrutamentoAberto) {
        return interaction.reply({
          content: '❌ Recrutamento fechado no momento.',
          ephemeral: true
        });
      }

      const guild = interaction.guild;
      const categoria = getChannel(guild, CATEGORY_TICKET);

      const canal = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: categoria?.id
      });

      await interaction.reply({ content: `🎟️ Ticket criado: ${canal}`, ephemeral: true });

      let respostas = [];
      const filter = m => m.author.id === interaction.user.id;

      for (let p of perguntas) {
        await canal.send(p);

        const collected = await canal.awaitMessages({ filter, max: 1, time: 60000 });
        if (!collected.size) return canal.send('⏰ Tempo esgotado.');

        respostas.push(collected.first().content);
      }

      await canal.send('📋 Respostas registradas. Aguarde avaliação.');

      const role = guild.roles.cache.find(r => r.name === ROLE_AVALIACAO);
      if (role) {
        const member = await guild.members.fetch(interaction.user.id);
        await member.roles.add(role);
      }
    }

  }

  // SLASH COMMANDS
  if (!interaction.isChatInputCommand()) return;

  const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

  if (interaction.commandName === 'recrutamento') {
    if (!isAdmin) return;

    recrutamentoAberto = true;
    return interaction.reply('✅ Recrutamento aberto!');
  }

  if (interaction.commandName === 'fechar_recrutamento') {
    if (!isAdmin) return;

    recrutamentoAberto = false;
    return interaction.reply('❌ Recrutamento fechado!');
  }

});

// PREFIX
client.on('messageCreate', async (msg) => {

  if (!msg.content.startsWith(PREFIX)) return;

  const cmd = msg.content.slice(1).split(' ')[0];
  const isAdmin = msg.member.permissions.has(PermissionsBitField.Flags.Administrator);

  if (cmd === 'recrutamento') {
    if (!isAdmin) return;
    recrutamentoAberto = true;
    msg.reply('✅ Recrutamento aberto!');
  }

  if (cmd === 'fechar_recrutamento') {
    if (!isAdmin) return;
    recrutamentoAberto = false;
    msg.reply('❌ Recrutamento fechado!');
  }

});

client.login(TOKEN);