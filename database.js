/**
 * Portfolio Database — Firebase Firestore
 * Collections: visitors, contacts, service_inquiries
 */
const PortfolioDB = {
    db: null,
    ready: false,

    init() {
        if (typeof FIREBASE_ENABLED === "undefined" || !FIREBASE_ENABLED) {
            console.info("[PortfolioDB] Firebase belum dikonfigurasi — data disimpan ke localStorage.");
            return false;
        }
        if (typeof firebase === "undefined") {
            console.warn("[PortfolioDB] Firebase SDK tidak dimuat.");
            return false;
        }
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            this.db = firebase.firestore();
            this.ready = true;
            console.info("[PortfolioDB] Terhubung ke Firestore.");
            return true;
        } catch (err) {
            console.error("[PortfolioDB] Gagal inisialisasi:", err);
            return false;
        }
    },

    async saveVisitor(data) {
        const payload = {
            name: data.name || "",
            email: data.email || "",
            purpose: data.purpose || "",
            visitedAt: data.visitedAt || new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        if (this.ready) {
            payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const doc = await this.db.collection("visitors").add(payload);
            localStorage.setItem("portfolioVisitor", JSON.stringify({ ...data, id: doc.id }));
            return { ok: true, id: doc.id, storage: "firestore" };
        }

        localStorage.setItem("portfolioVisitor", JSON.stringify(payload));
        return { ok: true, storage: "local" };
    },

    async saveContact(data) {
        const payload = {
            name: data.name || "",
            email: data.email || "",
            subject: data.subject || "",
            message: data.message || "",
            service: data.service || "general"
        };

        if (this.ready) {
            payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const doc = await this.db.collection("contacts").add(payload);
            return { ok: true, id: doc.id, storage: "firestore" };
        }

        const local = JSON.parse(localStorage.getItem("portfolioContacts") || "[]");
        local.push({ ...payload, createdAt: new Date().toISOString() });
        localStorage.setItem("portfolioContacts", JSON.stringify(local));
        return { ok: true, storage: "local" };
    },

    async saveServiceInquiry(data) {
        const payload = {
            service: data.service || "",
            name: data.name || "",
            email: data.email || "",
            message: data.message || ""
        };

        if (this.ready) {
            payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const doc = await this.db.collection("service_inquiries").add(payload);
            return { ok: true, id: doc.id, storage: "firestore" };
        }
        return { ok: false, storage: "none" };
    }
};
