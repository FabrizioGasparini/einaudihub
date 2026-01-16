Agisci come un Senior Full-Stack Developer e System Architect.

Devi progettare e sviluppare un'applicazione web moderna chiamata "EinaudiHUB", pensata come HUB digitale per gli studenti di una scuola superiore.

L'app è ispirata a "Connected" (app creata da studenti di una scuola di Firenze) e deve essere realmente utile nella vita scolastica quotidiana.

---

### STACK TECNOLOGICO
- Frontend: Next.js (App Router) + TypeScript
- Styling: Tailwind CSS
- Backend: API Routes / Server Actions
- Database: PostgreSQL + Prisma
- Auth: accesso solo con email scolastica (@scuola.it)
- Mobile-first, PWA-ready

---

## SISTEMA DI RUOLI (FONDAMENTALE)

Progetta un sistema di ruoli **chiaro, gerarchico e realistico**, adatto a un contesto scolastico.

### 1️⃣ STUDENTE
Ruolo di default.

Permessi:
- Visualizzare eventi, avvisi e contenuti pubblici
- Partecipare agli eventi (“ci vado / non ci vado”)
- Commentare eventi e post
- Creare post nella bacheca studenti
- Modificare il proprio profilo
- Partecipare ai sondaggi

Limitazioni:
- Non può pubblicare avvisi ufficiali
- Non può moderare contenuti altrui
- Non può gestire utenti

---

### 2️⃣ RAPPRESENTANTE DI CLASSE
Studente con responsabilità limitata alla propria classe.

Permessi aggiuntivi:
- Pubblicare avvisi visibili **solo alla propria classe**
- Creare sondaggi di classe
- Segnalare contenuti problematici con priorità
- Moderare (nascondere) post della propria classe

Ambito:
- Classe di appartenenza
- Nessun controllo su altre classi

---

### 3️⃣ RAPPRESENTANTE D’ISTITUTO
Studente eletto a livello di istituto.

Permessi aggiuntivi:
- Pubblicare avvisi ufficiali a livello di istituto
- Creare eventi scolastici
- Creare sondaggi globali
- Moderare bacheche pubbliche
- Evidenziare contenuti importanti
- Gestire comunicazioni studentesche ufficiali

Nota:
- Non ha accesso tecnico al sistema
- Agisce come “voce ufficiale degli studenti”

---

### 4️⃣ MODERATORE
Ruolo tecnico-operativo (studente fidato o staff).

Permessi:
- Moderare contenuti su tutta la piattaforma
- Nascondere / eliminare post e commenti
- Gestire segnalazioni
- Applicare sanzioni leggere (warning, blocco temporaneo)
- Nessun accesso a configurazioni di sistema

Obiettivo:
- Mantenere ordine e qualità nella community

---

### 5️⃣ ADMIN
Ruolo massimo, pochissimi utenti.

Permessi:
- Gestione completa utenti e ruoli
- Assegnazione / revoca ruoli
- Gestione classi e sezioni
- Gestione eventi e avvisi globali
- Accesso al database (logico)
- Configurazioni di sistema

Nota:
- Può essere uno studente sviluppatore o personale autorizzato

---

## REQUISITI TECNICI SUI RUOLI
- Implementare RBAC (Role-Based Access Control)
- Ogni API e azione deve verificare il ruolo
- I ruoli devono essere facilmente estendibili
- Associare ruoli a:
  - classe
  - istituto
  - ambito di visibilità

---

## FUNZIONALITÀ MVP
1. Auth con email scolastica
2. Profilo studente (nome, classe, interessi)
3. Eventi con partecipazione
4. Bacheca studenti con categorie
5. Sistema di ruoli funzionante
6. Avvisi ufficiali e di classe
7. Sondaggi (classe / istituto)

---

## UX / UI
- Interfaccia moderna, semplice, accessibile
- Differenziare visivamente i ruoli (badge, colori soft)
- Niente UI complessa: chiarezza prima di tutto

---

## OUTPUT RICHIESTO
Procedi per step:
1. Progetta l’architettura generale
2. Definisci lo schema Prisma includendo i ruoli
3. Elenca le pagine e le route
4. Implementa il sistema di ruoli e permessi
5. Fornisci codice reale, production-ready
6. Spiega brevemente le scelte architetturali

Ragiona prima di scrivere codice.
Evita soluzioni banali o poco scalabili.
