const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(200).send("NOVALUX Assistant est prêt !");
  }

  const message = req.body?.message;
  const chatId = message?.chat?.id;
  const question = message?.text;

  if (!chatId || !question) {
    return res.status(200).send("OK");
  }

  try {
    const aiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions: "Tu es NOVALUX Assistant. Tu réponds en français, avec politesse, aux clients d'une entreprise spécialisée dans les travaux d'aluminium, fenêtres, portes et rénovations. Pour les devis, demande les dimensions, les quantités et les besoins. Pour contacter l'entreprise, donne le WhatsApp 0777576457. Ne promets jamais un prix sans validation.",
          input: question
        })
      }
    );

    const data = await aiResponse.json();
    const answer = data.output?.flatMap(x => x.content || [])
      .find(x => x.type === "output_text")?.text
      || "Désolé, je n'arrive pas à répondre pour le moment.";

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: answer
      })
    });

    return res.status(200).send("OK");
  } catch (error) {
    return res.status(500).send("Erreur du bot");
  }
};
