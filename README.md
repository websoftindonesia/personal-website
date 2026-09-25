# personal-website
I am a person with a strong interest in computer science, with a focus on: [software, artificial intelligence, cybersecurity, or data analysis] development. Experienced in using various programming languages ​such as Python, Java, and C++, and accustomed to working with modern tools and frameworks.

## Mengaktifkan M. Fawwaz Assistant

Chat dan Voice AI ini memakai deployment dari Netlify Function di `netlify/functions/chat.mjs`, sehingga kunci APInya tidak pernah dikirim ke browser. Function memprioritaskan Gemini bila `GEMINI_API_KEY` tersedia, lalu memakai OpenAI bila hanya `OPENAI_API_KEY` yang dikonfigurasi.

1. Di dashboard Netlify, bisa buka **Site configuration → Environment variables**.
2. Untuk Gemini Free Tier, tambahkan `GEMINI_API_KEY` dari Google AI Studio. untuk Opsional: `GEMINI_MODEL` (default: `gemini-2.5-flash-lite`).
3. Alternatif OpenAI: tambahkan `OPENAI_API_KEY`. Opsional: `OPENAI_MODEL` (default: `gpt-5`).
4. Deploy ulang situs, dan Frontend akan memanggil `/api/chat`, yang dipetakan oleh `netlify.toml`.

Jangan menyimpan API key di `index.html`, JavaScript browser, ataupun juga repository.
