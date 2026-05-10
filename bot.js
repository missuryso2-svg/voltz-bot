console.log("🚀 Iniciando VOLTZ BOT...");

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');

const fs = require('fs');

// ================= CONFIG =================

// ⚠️ COLOQUE SEUS IDS AQUI
const TOKEN = process.env.TOKEN;
const GUILD_ID = '1502457314320453724';
const ROLE_ID = '1502459972045246484';
const CHANNEL_ID = '1502771475709562960';

// ==========================================

if (!TOKEN) {
  console.log("❌ TOKEN não encontrado!");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ================= BANCO =================

let data = {
  campeonatos: 0,
  ranked_wins: 0
};

try {
  if (fs.existsSync('data.json')) {
    data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
  } else {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  }
} catch (err) {
  console.log("⚠️ Erro no data.json, recriando...");
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}

function salvar() {
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}

// ================= READY =================

client.once(Events.ClientReady, async () => {
  console.log(`⚡ BOT ONLINE: ${client.user.tag}`);

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const canal = await guild.channels.fetch(CHANNEL_ID);

    if (!canal) {
      console.log("❌ Canal não encontrado");
      return;
    }

    const button = new ButtonBuilder()
      .setCustomId('verificar')
      .setLabel('Entrar na VOLTZ ⚡')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await canal.send({
      content: `⚡ **BEM-VINDO À VOLTZ TEAM** ⚡\nClique no botão abaixo para entrar`,
      components: [row]
    });

    console.log("✅ Mensagem enviada com sucesso");
  } catch (err) {
    console.log("❌ Erro no READY:", err);
  }
});

// ================= INTERAÇÕES =================

client.on(Events.InteractionCreate, async interaction => {
  try {

    // BOTÃO
    if (interaction.isButton()) {
      if (interaction.customId === 'verificar') {
        const role = interaction.guild.roles.cache.get(ROLE_ID);

        if (!role) {
          return interaction.reply({
            content: '❌ Cargo não encontrado',
            ephemeral: true
          });
        }

        await interaction.member.roles.add(role);

        return interaction.reply({
          content: '⚡ Acesso liberado!',
          ephemeral: true
        });
      }
    }

    // COMANDOS
    if (interaction.isChatInputCommand()) {

      if (interaction.commandName === 'registrar_campeonato') {
        const quantidade = interaction.options.getInteger('quantidade');

        data.campeonatos += quantidade;
        salvar();

        return interaction.reply(`🏆 Campeonatos: ${data.campeonatos}`);
      }

      if (interaction.commandName === 'ranked_win') {
        const quantidade = interaction.options.getInteger('quantidade');

        data.ranked_wins += quantidade;
        salvar();

        return interaction.reply(`🎮 Wins Ranked: ${data.ranked_wins}`);
      }

      if (interaction.commandName === 'stats') {
        return interaction.reply(`
📊 **VOLTZ STATS**

🏆 Campeonatos: ${data.campeonatos}
🎮 Ranked Wins: ${data.ranked_wins}
        `);
      }
    }

  } catch (err) {
    console.log("❌ Erro na interação:", err);
  }
});

// ================= LOGIN =================

client.login(TOKEN).catch(err => {
  console.log("❌ Erro ao logar:", err);
});