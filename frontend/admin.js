import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ⚠️ Em projeto real isso não fica exposto no front (mas ok para estudo)
const supabase = createClient(
  "https://fcknvwqerkyujhquugls.supabase.co", // SUPABASE_URL
  "sb_publishable_c-_9HXFPIQLd56o_2bixfw_oh-bMdXZ" // PUBLIC ANON KEY
);

async function uploadImagem(file) {
  if (!file) throw new Error("Nenhuma imagem selecionada");

  const nomeArquivo = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("produtos")
    .upload(nomeArquivo, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("produtos")
    .getPublicUrl(nomeArquivo);

  return data.publicUrl;
}

const form = document.getElementById("form-produto");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const nome = document.getElementById("nome").value.trim();
    const preco = parseFloat(document.getElementById("preco").value);
    const quantidade = Number(document.getElementById("quantidade").value);
    const categoria_id = Number(document.getElementById("categoria").value);
    const imagemFile = document.getElementById("imagem").files[0];

    // 🔒 validações básicas
    if (!nome || !preco || quantidade < 0 || !categoria_id) {
      status.innerText = "❌ Preencha todos os campos corretamente";
      return;
    }

    status.innerText = "⏳ Enviando imagem...";
    const imagemUrl = await uploadImagem(imagemFile);

    status.innerText = "⏳ Cadastrando produto...";

    const response = await fetch("/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        preco,
        quantidade,
        categoria_id,
        imagem_url: imagemUrl
      })
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar produto no backend");
    }

    status.innerText = "✅ Produto cadastrado com sucesso!";
    form.reset();

  } catch (err) {
    console.error(err);
    status.innerText = "❌ Erro ao cadastrar produto";
  }
});
