# personal-website
I am a person with a strong interest in computer science, with a focus on: [software, artificial intelligence, cybersecurity, or data analysis] development. Experienced in using various programming languages ​such as Python, Java, and C++, and accustomed to working with modern tools and frameworks.

## Mengaktifkan Wazryn Assistant

Chat dan Voice AI memakai Netlify Function di `netlify/functions/chat.mjs`, sehingga kunci API tidak pernah dikirim ke browser.

1. Di dashboard Netlify, buka **Site configuration → Environment variables**.
2. Tambahkan `OPENAI_API_KEY` dengan API key proyek OpenAI Anda.
3. Opsional: tambahkan `OPENAI_MODEL` untuk memilih model yang tersedia pada proyek Anda. Jika kosong, fungsi memakai `gpt-5`.
4. Deploy ulang situs. Frontend akan memanggil `/api/chat`, yang dipetakan oleh `netlify.toml`.

Jangan menyimpan `OPENAI_API_KEY` di `index.html`, JavaScript browser, atau repository.
