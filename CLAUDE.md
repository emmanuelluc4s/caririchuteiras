# CLAUDE.md — CARIRI CHUTEIRAS

> **Documento mestre de contexto para o Claude Code.**
> **LEITURA OBRIGATÓRIA** antes de iniciar qualquer módulo.
> Última atualização: Junho/2026
> Versão: 2.0 (identidade visual atualizada)

---

## SUMÁRIO

1. Visão geral
2. Identidade visual (preto + roxo neon)
3. Stack técnico
4. Arquitetura do projeto
5. Modelo de dados (schema)
6. Autenticação & permissões
7. Páginas públicas
8. Sistema de WhatsApp (núcleo de conversão)
9. Comparador de produtos
10. Filtros e busca
11. Gatilhos de conversão
12. Painel administrativo
13. Analytics & tracking
14. SEO técnico
15. Performance
16. Animações & loading
17. Acessibilidade
18. Legal & LGPD
19. Edge cases
20. Variáveis de ambiente
21. Deploy & infra
22. Roadmap modular (18 módulos)
23. Comandos & convenções
24. Princípios inegociáveis

---

## 1. VISÃO GERAL

**Nome:** Cariri Chuteiras
**Tipo:** Catálogo digital premium com geração de leads via WhatsApp
**Mercado:** Região do Cariri (Ceará) — Brasil
**Idioma:** Português (pt-BR) exclusivo
**Moeda:** Real (BRL)
**Modelo de negócio:** Loja física + delivery + atendimento WhatsApp

### Objetivo central

O site **NÃO realiza vendas diretamente**. Funciona como **catálogo premium** cujo único objetivo de conversão é levar o cliente para o **WhatsApp da loja** com mensagem pré-preenchida (produto, cor, numeração, preço, link). O cliente pode acumular múltiplos produtos antes de enviar (carrinho de intenção).

### Métricas de sucesso

- Lighthouse ≥ 95 (Performance, SEO, Acessibilidade, Boas Práticas)
- LCP < 2.0s em 4G
- Taxa de clique no WhatsApp ≥ 8% das visitas
- Mobile-first absoluto (80%+ do tráfego virá de smartphone)

### Categorias de produtos

Chuteiras Society · Chuteiras Campo · Chuteiras Futsal · Tênis Esportivos · Camisas de Times · Camisas Casuais · Roupas de Academia · Shorts Térmicos · Meias Esportivas · Caneleiras · Mochilas · Acessórios · Promoções · Lançamentos

### Marcas trabalhadas

Nike · Adidas · Puma · Penalty · Topper · Umbro

### Diferenciais do site

Avaliações com moderação · comparador de produtos · gatilhos de urgência · vistos recentemente · busca inteligente · quick view · mensagens promocionais rotativas

---

## 2. IDENTIDADE VISUAL

### Direção criativa

**Premium, moderna, agressiva.** Inspiração: **Nike × Foot Locker × Foot Locker Members**.

Contraste forte preto/roxo/branco. Iluminação **neon sutil** (nunca exagerada). O **escudo da Cariri Chuteiras** é elemento central — aparece no header, favicon, loading screen e como watermark sutil no hero.

### Paleta oficial

```css
:root {
  /* Cores principais */
  --bg-primary:      #0A0A0A;   /* preto suave (fundo principal) */
  --bg-secondary:    #141414;   /* preto cards */
  --bg-tertiary:     #1F1F1F;   /* hover/elevated */
  --neon:            #6B1DFF;   /* roxo neon — CTAs, destaques */
  --neon-dark:       #3D0A99;   /* roxo escuro — profundidade */
  --neon-hover:      #A855F7;   /* magenta — hover */
  --neon-glow:       rgba(107, 29, 255, 0.45); /* sombra/glow */

  /* Neutros */
  --white:           #FFFFFF;
  --ice:             #F5F3FF;   /* branco gelo p/ destaques */
  --gray-100:        #E5E5E5;
  --gray-400:        #A3A3A3;
  --gray-600:        #525252;
  --border:          #262626;

  /* Funcionais */
  --whatsapp:        #25D366;
  --whatsapp-dark:   #128C7E;
  --success:         #10B981;
  --danger:          #EF4444;
  --warning:         #F59E0B;
}

/* Modo claro (toggle) */
[data-theme="light"] {
  --bg-primary:      #FFFFFF;
  --bg-secondary:    #F8F9FB;
  --bg-tertiary:     #EFF0F4;
  --border:          #E5E7EB;
  /* neon permanece — é a marca */
}
```

### Tipografia

- **Anton** — títulos, hero, banners promocionais, números grandes (impacto máximo, peso pesado, esportivo)
- **Inter** — corpo, UI, descrições, formulários

```css
font-family-display: 'Anton', sans-serif;  /* títulos */
font-family-body:    'Inter', sans-serif;  /* corpo */
```

Carregar via `next/font/google` com `display: swap` e `preload`.

### Tema

- **Padrão: escuro** (`data-theme="dark"`)
- Toggle no **header** (ícone sol/lua à direita do menu)
- Persistir escolha no `localStorage` com chave `cc-theme`
- Detectar `prefers-color-scheme` na primeira visita
- Transição suave de 200ms ao trocar tema

### Border radius padrão

- `--radius-sm`: 8px (badges, chips)
- `--radius-md`: 12px (botões, inputs)
- `--radius-lg`: 16px (cards)
- `--radius-xl`: 24px (modais, hero containers)

Equilíbrio: moderno sem ser fofo, esportivo sem ser quadrado.

### Efeitos neon (regras de uso)

| Elemento | Efeito |
|---|---|
| CTAs primários | `box-shadow: 0 0 24px var(--neon-glow)` + brilho ao hover |
| Cards no hover | Borda neon `1px solid var(--neon)` + glow suave |
| Títulos hero | Letras com `text-shadow: 0 0 12px var(--neon-glow)` (sutil) |
| Badges destaque ("NOVO", "PROMO") | Fundo neon sólido + sombra glow |
| Inputs focus | Borda neon + outline ring `var(--neon-glow)` |

**Regra de ouro:** se o efeito neon estiver "competindo" com a foto do produto, está exagerado. O produto sempre vence.

### Tratamento de imagens de produto

**Estilo Nike**: foto isolada sobre `--bg-secondary`, sombra inferior sutil para "flutuação". Sem fundos coloridos por trás do produto — só o glow neon aparece no hover do card.

### Hero principal

**Estilo Foot Locker**: fundo preto absoluto, foto/render do produto em destaque centralizado, tipografia gigante em **Anton** com leve glow neon, CTA grande gradiente roxo. Carrossel automático (5s por slide), com indicadores neon na base.

### Banner promocional do topo

Barra fina (36px) com gradiente sutil `var(--neon-dark) → var(--bg-primary) → var(--neon-dark)` e mensagens rotativas com ícones animados (`AnimatePresence` do Framer Motion).

### Logo / Escudo

- Versões em `/public`: `logo-color.svg`, `logo-white.svg`, `logo-mono.svg`, `escudo.svg`, `favicon.ico`, `apple-touch-icon.png`
- **Header**: logo horizontal (escudo + nome) com altura 36–40px
- **Favicon**: escudo
- **Loading screen / 404**: escudo grande com animação de pulse + glow
- **Hero**: escudo gigante como watermark de fundo (opacity 0.04)
- **Hover do escudo no header**: rotação suave + glow neon

---

## 3. STACK TÉCNICO

### Frontend
- **Next.js 14+** (App Router, Server Components, Server Actions)
- **TypeScript** strict mode
- **Tailwind CSS** + design tokens em `globals.css`
- **shadcn/ui** como base (Button, Input, Sheet, Dialog, Select, Tabs)
- **Framer Motion** — animações
- **Lucide React** — ícones
- **next/image** — todas as imagens (AVIF + WebP automático)
- **next/font** — Anton + Inter
- **Embla Carousel** — hero e carrosséis horizontais
- **TipTap** — editor visual completo (descrição de produtos no admin)
- **Sonner** — toasts

### Backend / dados
- **Supabase** — Postgres + Auth + Storage + RLS
- **Prisma** — ORM com schema versionado
- **Server Actions** para mutações
- **Zod** — validação de inputs

### Integrações
- **Microsoft Clarity** — heatmap + session replay (grátis)
- **Sentry** — monitoramento de erros (grátis até 5k/mês)
- **Vercel Analytics** — métricas de performance
- **PostHog** — funis e eventos avançados
- **Meta Pixel** + **Google Analytics 4** + **Google Tag Manager** — tracking de ads

### Auxiliares
- `react-hook-form` + `@hookform/resolvers/zod` — formulários
- `sharp` — processamento de imagens no upload
- `embla-carousel-react` — carrosséis
- `cmdk` — busca command-palette
- `recharts` — gráficos no admin
- `date-fns` — datas em pt-BR

### Infra
- **Vercel** — hosting (Edge Runtime onde fizer sentido)
- **Supabase Storage** — imagens
- **Subdomínio Vercel** no início (`cariri-chuteiras.vercel.app`)
- Domínio próprio adicionado depois pelo painel da Vercel

---

## 4. ARQUITETURA DO PROJETO

```
cariri-chuteiras/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                       # Home
│   │   ├── produto/[slug]/page.tsx
│   │   ├── categoria/[slug]/page.tsx
│   │   ├── promocoes/page.tsx
│   │   ├── novidades/page.tsx
│   │   ├── quem-somos/page.tsx
│   │   ├── contato/page.tsx
│   │   ├── busca/page.tsx
│   │   ├── comparar/page.tsx
│   │   ├── privacidade/page.tsx
│   │   ├── termos/page.tsx
│   │   └── manutencao/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── layout.tsx                     # protegido
│   │   ├── page.tsx                       # dashboard
│   │   ├── produtos/{page,[id]/page,novo/page}.tsx
│   │   ├── categorias/
│   │   ├── cupons/
│   │   ├── avaliacoes/                    # moderação
│   │   ├── leads/                         # log WhatsApp
│   │   ├── usuarios/                      # gerenciar admins
│   │   ├── auditoria/                     # audit log
│   │   ├── relatorios/                    # PDF/CSV
│   │   └── configuracoes/
│   ├── api/
│   │   ├── track/route.ts
│   │   ├── upload/route.ts
│   │   ├── revalidate/route.ts
│   │   └── sentry/route.ts
│   ├── layout.tsx                         # root
│   ├── globals.css
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── not-found.tsx                      # 404
│   └── error.tsx                          # erro global
├── components/
│   ├── ui/                                # shadcn/ui
│   ├── public/
│   │   ├── layout/
│   │   │   ├── promo-bar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── mobile-menu.tsx
│   │   │   ├── footer.tsx                 # estilo Nike (grande)
│   │   │   └── theme-toggle.tsx
│   │   ├── home/
│   │   │   ├── hero-carousel.tsx
│   │   │   ├── category-grid.tsx
│   │   │   ├── featured-products.tsx
│   │   │   ├── bestsellers-ranking.tsx
│   │   │   ├── new-arrivals.tsx
│   │   │   ├── brands-strip.tsx
│   │   │   ├── testimonials.tsx
│   │   │   └── whatsapp-cta-block.tsx
│   │   ├── product/
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── product-quick-view.tsx
│   │   │   ├── product-gallery.tsx        # thumbs verticais
│   │   │   ├── product-zoom.tsx           # lupa hover
│   │   │   ├── variant-selector.tsx       # cor + numeração
│   │   │   ├── urgency-banner.tsx         # X pessoas vendo
│   │   │   ├── reviews-section.tsx
│   │   │   └── related-products.tsx
│   │   ├── catalog/
│   │   │   ├── filters-sidebar.tsx
│   │   │   ├── filters-drawer-mobile.tsx
│   │   │   ├── active-filters.tsx
│   │   │   └── sort-dropdown.tsx
│   │   ├── search/
│   │   │   ├── search-bar.tsx             # cmdk
│   │   │   ├── search-suggestions.tsx
│   │   │   └── recent-searches.tsx
│   │   ├── compare/
│   │   │   ├── compare-bar.tsx            # bottom sticky
│   │   │   └── compare-table.tsx
│   │   ├── whatsapp/
│   │   │   ├── whatsapp-floating-button.tsx
│   │   │   ├── whatsapp-product-button.tsx
│   │   │   └── whatsapp-cart-drawer.tsx   # acumulador
│   │   ├── recently-viewed/
│   │   ├── exit-intent-modal.tsx
│   │   ├── cookie-banner.tsx
│   │   ├── share-buttons.tsx
│   │   └── skeleton/                      # skeleton screens
│   └── admin/
│       ├── dashboard/
│       ├── product-form/
│       ├── image-uploader.tsx
│       ├── bulk-actions.tsx
│       ├── rich-editor.tsx                # TipTap
│       └── ...
├── lib/
│   ├── supabase/{server.ts,client.ts,middleware.ts}
│   ├── prisma.ts
│   ├── whatsapp/
│   │   ├── build-message.ts
│   │   ├── cart-store.ts                  # zustand p/ carrinho intenção
│   │   └── tracking.ts
│   ├── analytics/
│   │   ├── track.ts                       # eventos
│   │   ├── clarity.ts
│   │   ├── meta-pixel.ts
│   │   └── ga4.ts
│   ├── seo/{metadata.ts,schema.ts,sitemap.ts}
│   ├── images/{optimize.ts,upload.ts}
│   ├── validators/                        # Zod schemas
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                            # produtos fictícios
├── public/
│   ├── logo-color.svg
│   ├── logo-white.svg
│   ├── escudo.svg
│   ├── favicon.ico
│   └── fonts/
├── middleware.ts
├── tailwind.config.ts
├── .env.example
└── CLAUDE.md
```

### Convenções

- **Server Components por padrão**. `'use client'` só com motivo claro.
- **Server Actions** para mutações do admin (Next sai com CSRF protegido).
- Arquivos em `kebab-case`, componentes em `PascalCase`.
- **Zero `any`** — preferir `unknown` + narrowing com Zod.
- Imports absolutos com `@/`.
- Cada componente client tem variant de skeleton.

---

## 5. MODELO DE DADOS

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL"); directUrl = env("DIRECT_URL") }

model Product {
  id              String   @id @default(cuid())
  sku             String   @unique               // gerado automaticamente
  slug            String   @unique
  name            String
  description     String?  @db.Text              // HTML do TipTap
  brand           String
  categoryId      String
  category        Category @relation(fields: [categoryId], references: [id])
  price           Decimal  @db.Decimal(10, 2)
  promoPrice      Decimal? @db.Decimal(10, 2)
  installments    Int?                            // ex: 10 (10x sem juros)
  installmentFree Boolean  @default(false)        // se é sem juros
  isActive        Boolean  @default(true)         // se inativo OU sem estoque → invisível no site
  isFeatured      Boolean  @default(false)
  isNew           Boolean  @default(false)        // badge automático por 30 dias
  isBestSellerManual Boolean @default(false)      // boost manual no ranking
  videoUrl        String?                          // YouTube ou MP4
  material        String?
  weight          String?
  collar          String?                          // gola
  technology      String?                          // ex: Air Zoom
  useIndication   String?                          // ex: gramado natural
  warranty        String?
  origin          String?                          // nacional/importado
  metaTitle       String?
  metaDescription String?
  images          ProductImage[]
  variants        ProductVariant[]
  reviews         Review[]
  views           Int      @default(0)
  whatsappClicks  Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@index([categoryId, isActive])
  @@index([brand])
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  urlOriginal String
  urlLarge   String                                // ~1200px AVIF
  urlMedium  String                                // ~600px AVIF
  urlThumb   String                                // ~200px AVIF
  alt       String?
  order     Int     @default(0)
}

model ProductVariant {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  color     String                                  // "Azul Royal"
  colorHex  String?                                 // "#0057FF"
  size      String                                  // "41" ou "M"
  stock     Int     @default(0)                     // estoque por variante
  @@unique([productId, color, size])
}

model Category {
  id        String    @id @default(cuid())
  slug      String    @unique
  name      String
  image     String?
  metaTitle String?
  metaDescription String?
  order     Int       @default(0)
  isActive  Boolean   @default(true)
  products  Product[]
}

model Coupon {
  id            String    @id @default(cuid())
  code          String    @unique
  description   String?
  discountType  String                                  // percentage | fixed
  discountValue Decimal   @db.Decimal(10, 2)
  validUntil    DateTime?
  maxUses       Int?
  uses          Int       @default(0)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
}

model Review {
  id           String   @id @default(cuid())
  productId    String
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  customerName String
  city         String?
  rating       Int                                       // 1–5
  comment      String   @db.Text
  isApproved   Boolean  @default(false)
  ipHash       String?                                   // anti-spam
  createdAt    DateTime @default(now())
}

model WhatsappLead {
  id          String   @id @default(cuid())
  items       Json                                       // array de produtos enviados
  couponCode  String?
  userAgent   String?
  referrer    String?
  device      String?                                    // mobile/desktop
  city        String?                                    // geoip aproximado
  createdAt   DateTime @default(now())
}

model AdminUser {
  id        String   @id @default(cuid())
  authId    String   @unique                              // FK auth.users do Supabase
  email     String   @unique
  name      String?
  role      String   @default("admin")                    // admin | editor | viewer
  createdAt DateTime @default(now())
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String                                       // AdminUser.id
  userEmail  String
  action     String                                       // create | update | delete
  entity     String                                       // product | category | coupon | review
  entityId   String?
  changes    Json?                                        // diff
  ipAddress  String?
  createdAt  DateTime @default(now())
  @@index([entity, entityId])
  @@index([userId])
}

model SiteEvent {
  id         String   @id @default(cuid())
  type       String                                       // ver enum abaixo
  productId  String?
  metadata   Json?
  sessionId  String?
  userAgent  String?
  referrer   String?
  device     String?
  createdAt  DateTime @default(now())
  @@index([type, createdAt])
}

model SiteConfig {
  id                  String   @id @default("singleton")
  whatsappNumber      String
  storeAddress        String?
  storeHours          String?                              // editável
  instagramUrl        String?
  tiktokUrl           String?
  googleMapsEmbed     String?
  promoBarMessages    Json                                  // array de strings
  isMaintenanceMode   Boolean  @default(false)
  maintenanceMessage  String?
  heroSlides          Json                                  // array de slides
  updatedAt           DateTime @updatedAt
}
```

### Enum de eventos (SiteEvent.type)

`product_view` · `category_view` · `search` · `whatsapp_click_single` · `whatsapp_click_cart` · `cart_add` · `cart_remove` · `coupon_copy` · `filter_apply` · `hero_click` · `quick_view_open` · `compare_add` · `share_click` · `exit_intent_shown` · `theme_toggle`

### Row Level Security (RLS)

- **Leitura pública**: `Product` (isActive=true), `Category`, `Review` (isApproved=true), `Coupon` (isActive=true), `SiteConfig`
- **Insert público (anônimo)**: `WhatsappLead`, `SiteEvent`, `Review` (com isApproved=false)
- **Tudo o resto**: apenas usuários autenticados com role apropriada
- **`AuditLog`**: insert via trigger no banco, leitura só admin

---

## 6. AUTENTICAÇÃO & PERMISSÕES

### Estratégia

- **Supabase Auth** com email + senha
- Tabela `AdminUser` sincronizada via trigger SQL
- **Middleware** verifica sessão em todas as rotas `/admin/**`
- **RLS** como segunda barreira

### Níveis de acesso

| Role | Permissões |
|---|---|
| `admin` | Tudo: CRUD completo, gerenciar usuários, configurações, ver auditoria |
| `editor` | CRUD de produtos/categorias/cupons, moderar avaliações, ver leads |
| `viewer` | Apenas leitura: dashboard, leads, relatórios |

### Boas práticas

- **Nunca expor `service_role_key`** no client
- Rate limiting em `/api/track` e `/api/upload`
- Server Actions já protegem CSRF
- Logout automático após 24h de inatividade
- Audit log obrigatório em toda mutação de admin

---

## 7. PÁGINAS PÚBLICAS

### 7.1 Home (`/`)

1. **Promo bar** (topo, 36px) — rotação automática de mensagens com ícones
2. **Header sticky** — logo + busca + menu + tema toggle + WhatsApp icon
3. **Hero carrossel** estilo Foot Locker — fundo preto, produto em destaque, tipografia Anton gigante, CTA gradiente neon, 5 slides com autoplay 5s
4. **Categorias em destaque** — grid 4 colunas (desktop) / 2 (mobile), hover com zoom + glow neon
5. **Produtos em destaque** — carrossel horizontal
6. **Ranking dos mais vendidos** — visual de ranking com posições (1º, 2º, 3º…) baseado em fórmula `0.7 × whatsappClicks + 0.3 × isBestSellerManual_boost`
7. **Banner promocional** — full-width com contador regressivo
8. **Lançamentos** — grid com badge "NOVO" neon
9. **Marcas** — strip horizontal monocromático, hover revela cor
10. **Depoimentos** — carrossel de cards com estrelas
11. **Bloco WhatsApp CTA** — convite grande para atendimento
12. **Footer estilo Nike** — 4 colunas grandes: Categorias / Sobre / Atendimento / Redes sociais + selos + endereço

### 7.2 Página de produto (`/produto/[slug]`) — **MÓDULO CRÍTICO**

Desktop em 2 colunas. Mobile empilhado.

**Coluna esquerda (galeria):**
- Thumbnails verticais à esquerda (estilo Nike)
- Imagem principal grande à direita
- **Zoom por hover (lupa)** no desktop
- Swipe entre imagens no mobile
- Botão de tela cheia
- Vídeo (YouTube embed ou MP4) como item da galeria se disponível

**Coluna direita (informações + conversão):**
- Breadcrumb
- Badge da marca (gradiente neon)
- H1 com nome do produto
- Estrelas + nº de avaliações
- Preço grande:
  - Se `promoPrice`: preço original riscado + promo em neon + selo de % off
  - Parcelamento abaixo: "ou 10x de R$ XX,XX sem juros" (configurado manualmente pelo admin)
- **Banner de urgência** rotativo:
  - "🔥 12 pessoas vendo agora"
  - "⚡ Últimas 3 unidades"
  - "📈 Vendido 47 vezes esta semana"
- **Seletor de cor** — swatches circulares com hex (label do nome ao passar)
- **Seletor de numeração** — grid de botões, desabilitar fora de estoque
- Status de estoque (badge)
- **Botão "Adicionar à conversa"** (verde WhatsApp, grande)
- **Botão "Comparar"** (outline neon)
- Cupom ativo (se houver): "Use o código `CARIRI10`" + botão copiar
- Descrição em accordion (vinda do TipTap)
- Atributos extras (material, peso, gola, tecnologia, indicação de uso, garantia, origem) em grid
- Compartilhamento em todas as redes (WhatsApp, Instagram Stories, TikTok, X, copiar link)
- Tabela de medidas (numeração) — modal/sheet
- Informação de entrega: "Entregamos no Cariri — consulte no WhatsApp"

**No mobile**, botão flutuante circular de WhatsApp sempre no canto inferior direito.

**Abaixo do fold:**
- Avaliações dos clientes (filtros por estrelas, paginação)
- Formulário "Deixe sua avaliação" (com moderação)
- Produtos relacionados (mesma categoria, depois mesma marca, depois cor similar)
- Outros produtos da mesma marca

**Schema.org Product** completo (offers, aggregateRating, brand, image).

### 7.3 Categoria (`/categoria/[slug]`)

- Hero da categoria (banner + título Anton gigante)
- Filtros laterais (desktop) / drawer (mobile)
- Grid de produtos com ordenação e paginação
- Chip de filtros ativos
- Skeleton durante carregamento

### 7.4 Promoções (`/promocoes`)

- Hero com contador regressivo da promoção principal
- Lista de cupons ativos com botão "Copiar código"
- Grid de produtos com `promoPrice` ativo
- Badge de % off em cada card

### 7.5 Novidades (`/novidades`)

- Grid de produtos com `isNew=true` (últimos 30 dias)
- Badge "NOVO" neon

### 7.6 Quem Somos (`/quem-somos`)

- Hero com escudo gigante + tagline
- História da Cariri Chuteiras (texto a definir)
- Valores: atendimento, qualidade, autenticidade
- Foto da loja física
- CTA WhatsApp grande

### 7.7 Contato (`/contato`)

- WhatsApp (botão grande)
- Instagram + TikTok
- Endereço + Google Maps embed
- Horário de atendimento (vem do `SiteConfig`)
- Formulário opcional (envia direto para WhatsApp)

### 7.8 Busca (`/busca?q=...`)

- Header com termo buscado e nº de resultados
- Filtros laterais
- Estado vazio com sugestões e produtos populares
- Sugestões enquanto digita (debounce 200ms)
- Histórico de buscas recentes
- Buscas populares como pílulas

### 7.9 Comparador (`/comparar?ids=...`)

- Tabela horizontal comparando até 4 produtos
- Linhas: foto, nome, marca, preço, parcelamento, avaliações, atributos
- Botão WhatsApp por produto + botão "Enviar todos no WhatsApp"

### 7.10 Páginas legais

- `/privacidade` — Política de Privacidade LGPD (gerado do zero)
- `/termos` — Termos de Uso (padrão adaptado)

### 7.11 Manutenção (`/manutencao`)

- Página dedicada ativada via `SiteConfig.isMaintenanceMode`
- Mensagem customizável + botão WhatsApp
- Middleware redireciona todas as rotas (exceto admin) para esta página quando ativo

### 7.12 404 (`/not-found`)

- Escudo grande pulsando neon
- "Esse produto driblou a gente"
- Botões: voltar para home, buscar, abrir WhatsApp
- Sugestões de produtos populares

---

## 8. SISTEMA DE WHATSAPP

**O coração do site.** Toda decisão de UX é avaliada pela pergunta: "isso aumenta o clique no WhatsApp?"

### Configuração

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=5588XXXXXXXXX
```

### Carrinho de intenção (acumulador)

Cliente clica em "Adicionar à conversa" em vários produtos. Esses itens ficam num **store Zustand persistido no localStorage** (`cc-cart`).

Botão flutuante circular no canto inferior direito mostra contador `(N)` quando há itens.

Ao clicar no botão flutuante:
- Se `N === 0` → mensagem genérica: "Olá, tenho interesse em conhecer os produtos da Cariri Chuteiras"
- Se `N === 1` → mensagem detalhada com o produto
- Se `N > 1` → mensagem com todos os produtos formatada

### Geração da mensagem

```ts
// lib/whatsapp/build-message.ts
type CartItem = {
  productName: string
  brand: string
  color?: string
  size?: string
  price: number
  promoPrice?: number
  productUrl: string
}

export function buildWhatsappUrl(items: CartItem[], couponCode?: string) {
  let msg = 'Olá! Tudo bem? Vim pelo site da *Cariri Chuteiras*.\n\n'

  if (items.length === 1) {
    const p = items[0]
    msg += `Tenho interesse no seguinte produto:\n\n`
    msg += `📦 *Produto:* ${p.brand} ${p.productName}\n`
    if (p.color) msg += `🎨 *Cor:* ${p.color}\n`
    if (p.size) msg += `📏 *Numeração:* ${p.size}\n`
    msg += `💰 *Preço:* ${formatBRL(p.promoPrice ?? p.price)}\n`
    msg += `🔗 ${p.productUrl}\n`
  } else {
    msg += `Tenho interesse nos seguintes ${items.length} produtos:\n\n`
    items.forEach((p, i) => {
      msg += `*${i + 1}.* ${p.brand} ${p.productName}\n`
      if (p.color) msg += `   🎨 ${p.color}`
      if (p.size) msg += ` | 📏 ${p.size}`
      msg += `\n   💰 ${formatBRL(p.promoPrice ?? p.price)}\n   🔗 ${p.productUrl}\n\n`
    })
  }

  if (couponCode) msg += `\n🎟️ *Cupom:* ${couponCode}\n`
  msg += `\nGostaria de mais informações e disponibilidade. Obrigado!`

  const encoded = encodeURIComponent(msg)
  return `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encoded}`
}
```

### Tracking obrigatório

Antes de abrir o `wa.me`:
1. `fetch('/api/track', { method: 'POST', keepalive: true, body: ... })`
2. Tipo: `whatsapp_click_single` ou `whatsapp_click_cart`
3. Inserir registro em `WhatsappLead`
4. Incrementar `Product.whatsappClicks` para cada item

### Variantes do botão WhatsApp

| Local | Estilo |
|---|---|
| Card do produto (grid) | Ícone WhatsApp pequeno revelado no hover |
| Página do produto | Botão grande verde "Adicionar à conversa" |
| Flutuante circular | Sempre no canto inferior direito do mobile (e desktop), com badge contador |
| Header | Ícone discreto com tooltip |
| Footer | Bloco grande com CTA |
| Exit intent | Modal oferecendo atendimento |
| 404 / Manutenção | Botão central destacado |

Todos com cor `var(--whatsapp)` (#25D366), hover `var(--whatsapp-dark)`, sem neon roxo (manter identidade verde do WhatsApp para confiança visual).

---

## 9. COMPARADOR DE PRODUTOS

- Até 4 produtos simultâneos
- Estado em Zustand persistido no localStorage (`cc-compare`)
- Bottom sticky bar aparece quando há ≥ 1 produto em comparação
- Página `/comparar?ids=a,b,c` mostra tabela
- Botão "Enviar todos no WhatsApp" usa o mesmo sistema do carrinho

---

## 10. FILTROS E BUSCA

### Filtros disponíveis

- **Categoria** (radio)
- **Marca** (checkbox múltiplo)
- **Cor** (swatches clicáveis)
- **Numeração** (botões em grid)
- **Faixa de preço** (slider duplo)
- **Promoções** (toggle)
- **Lançamentos** (toggle)
- **Em estoque** (toggle)
- **Ordenação**: mais vendidos · menor preço · maior preço · novidades · maior desconto · relevância

### Comportamento

- Estado refletido na **URL** (`?marca=nike,adidas&cor=azul&preco=100-500&sort=mais-vendidos`)
- Mudanças aplicam **sem recarregar** (`useTransition` + Server Component re-render)
- Chip de filtros ativos no topo, removível individualmente
- Botão "Limpar tudo"
- No mobile: `Sheet` lateral acionado por botão flutuante (acima do WhatsApp)

### Busca inteligente

- Componente `cmdk` (command palette)
- Debounce 200ms
- **Sugestões enquanto digita** (busca em `name`, `brand`, `category.name`, `description`)
- **Produtos populares** mostrados ao focar com input vazio
- **Histórico de buscas** (localStorage, últimas 5)
- Buscas zero-result → CTA WhatsApp "Não encontrou? Pergunte para a gente"

---

## 11. GATILHOS DE CONVERSÃO

### Pop-up exit intent

Dispara quando o cursor sai pela parte superior do navegador (desktop) ou após 30s sem interação (mobile).

Conteúdo: oferecer atendimento personalizado via WhatsApp com a frase "Tá com dúvida? Fala com a gente — atendimento na hora".

**Mostrar apenas 1 vez por sessão** (sessionStorage).

### Mensagens de urgência (na página do produto)

Rotativas a cada 8s no banner de urgência:

- "🔥 **X pessoas** vendo este produto agora" — número simulado (12–35) baseado em hash do `productId + hora`
- "⚡ Últimas **X unidades** em estoque" — só aparece se soma de `variants.stock` < 5
- "📈 Vendido **X vezes** esta semana" — baseado em `whatsappClicks` dos últimos 7d

**Diretriz ética:** sempre baseado em dados reais ou ranges plausíveis. Sem mentir abertamente.

### Vistos recentemente

- Carrossel horizontal no rodapé de qualquer página (a partir da 2ª visualização)
- Lista no header (dropdown ao passar o mouse no ícone)
- Armazenado em localStorage (últimos 8 produtos)

### Quick view

- Botão "Ver detalhes" ou clique no card
- Expande o card em modal central
- Mostra: galeria mini, nome, preço, cor, numeração, descrição curta, botão WhatsApp
- Botão "Ver página completa" para ir ao `/produto/[slug]`

### Cupons como gatilho

- Cupom **não aplica desconto no site** (não há checkout)
- Banner na promo bar do topo rotaciona códigos ativos
- Botão "Copiar código" copia para clipboard + abre WhatsApp com cupom já na mensagem
- Incrementa `Coupon.uses` quando copiado

---

## 12. PAINEL ADMINISTRATIVO

### Dashboard (`/admin`)

**KPIs no topo (cards com glow neon):**
- Cliques no WhatsApp (hoje · 7d · 30d) com setinha vs período anterior
- Visualizações totais
- Taxa de conversão (cliques / visualizações)
- Produtos ativos
- Leads gerados hoje

**Filtros globais:** datepicker customizado (escolher qualquer 2 períodos para comparar).

**Gráficos (recharts) — todos com tema neon:**
- Cliques WhatsApp por dia (área)
- Top 10 produtos por visualização (barra horizontal)
- Top 10 produtos por clique WhatsApp (barra horizontal)
- Distribuição por categoria (pie chart)
- Funil completo: visitas → produto → adicionar carrinho → WhatsApp
- Buscas mais realizadas (lista)
- Origem do tráfego (referrer)
- Mobile vs Desktop

**Tabela:** últimos 20 leads do WhatsApp.

### Produtos (`/admin/produtos`)

- Listagem com busca, filtros, ordenação, paginação
- **Bulk actions**:
  - Ativar / desativar / excluir em lote
  - Aumentar / diminuir preço em % ou valor fixo em lote
  - Aplicar promoção (definir promoPrice como X% do price) em lote
- **Criar produto** — cadastro **rápido** (essencial: nome, marca, categoria, preços, 1 foto, status) com botão "Cadastrar e editar detalhes"
- **Editar produto** — formulário completo em abas:
  1. Informações básicas
  2. Imagens (drag & drop múltiplo + reorder + URL Instagram + compressão automática)
  3. Variantes (cor + numeração + estoque, criar em massa via matriz)
  4. Atributos (material, peso, gola, tecnologia, uso, garantia, origem)
  5. SEO (meta title, meta description, slug editável)
  6. Descrição (TipTap rich text)
  7. Vídeo (URL YouTube ou upload MP4)
- **Pré-visualização**: botão "Ver como ficaria" abre nova aba com query `?preview=true` (não conta view, não indexa)
- **Duplicar produto**: 1 clique → cria cópia com `(cópia)` no nome, status inativo, novo SKU
- **Excluir**: soft delete + confirmação
- **SKU**: gerado automaticamente no formato `MARCA-CATEGORIA-CONTADOR` (ex: `NIK-CHUTSOC-0042`)

### Categorias (`/admin/categorias`)

- CRUD com imagem, ordem (drag-to-reorder), slug editável
- Status ativo/inativo

### Cupons (`/admin/cupons`)

- CRUD: código, tipo (%/R$), valor, validade, limite de usos
- Botão "Copiar código"
- Métricas de uso

### Avaliações (`/admin/avaliacoes`)

- **Fila de moderação** (não aprovadas no topo)
- Aprovar / reprovar / editar / excluir
- Visão por produto
- Filtro por estrelas
- Bloquear IP que mande spam

### Leads WhatsApp (`/admin/leads`)

- Lista de todos os cliques
- Filtros por data, produto, cupom usado
- Export CSV

### Usuários admin (`/admin/usuarios`) — só `role=admin`

- Convidar novo admin/editor/viewer
- Editar role
- Desativar acesso

### Auditoria (`/admin/auditoria`) — só `role=admin`

- Log completo de alterações
- Filtros: usuário, ação, entidade, período
- Diff visual das mudanças

### Relatórios (`/admin/relatorios`)

- Export CSV (manual a qualquer hora):
  - Produtos
  - Leads do WhatsApp
  - Avaliações
  - Eventos do site
- **PDF mensal automático** enviado por email no dia 1 de cada mês

### Configurações (`/admin/configuracoes`)

- **Geral**:
  - Número do WhatsApp
  - Endereço da loja
  - Horário de atendimento (texto livre, editável)
  - Instagram URL
  - TikTok URL
  - Google Maps embed
- **Promo bar**: editar/reordenar mensagens
- **Hero**: editar slides (imagem, título, subtítulo, CTA, link, ordem, ativo)
- **Banners promocionais**: secundários da home
- **Modo manutenção**: toggle + mensagem customizável
- **Texto institucional**: Quem somos, Termos, Política de Privacidade (rich text TipTap)

---

## 13. ANALYTICS & TRACKING

### Eventos rastreados em `SiteEvent`

`product_view` · `category_view` · `search` (com termo) · `whatsapp_click_single` · `whatsapp_click_cart` · `cart_add` · `cart_remove` · `coupon_copy` · `filter_apply` · `hero_click` · `quick_view_open` · `compare_add` · `share_click` · `exit_intent_shown` · `theme_toggle`

### Integrações externas

| Ferramenta | Para quê |
|---|---|
| **Microsoft Clarity** | Heatmaps + session replay (grátis, ilimitado) |
| **Vercel Analytics** | Web Vitals e visitas |
| **PostHog** | Funis e cohort |
| **Meta Pixel** | Lookalike + retargeting de tráfego pago |
| **Google Analytics 4** | Métricas e Google Ads |
| **Google Tag Manager** | Gerenciar pixels sem deploy |
| **Sentry** | Erros em produção |

### Implementação

- Endpoint `POST /api/track` recebe eventos e insere em `SiteEvent`
- `sessionId` por cookie httpOnly de 30 dias
- `useAnalytics()` hook que dispara para todas as integrações em paralelo
- Eventos críticos (WhatsApp click) com `keepalive: true` no fetch

### Privacidade

- Sem PII
- Sem fingerprinting
- Honra `Do Not Track`
- Banner de cookies LGPD simples (aceitar/recusar) — recusar bloqueia Meta Pixel, GA4, PostHog, Clarity (mantém apenas tracking essencial interno)

---

## 14. SEO TÉCNICO

### Por página

- `generateMetadata()` em todas as rotas dinâmicas
- **Open Graph** com imagem grande do produto
- **Twitter Card** large image
- **Schema.org**:
  - `Product` em `/produto/[slug]` (offers, aggregateRating, brand, image)
  - `LocalBusiness` em `/contato` (endereço, horário, telefone)
  - `BreadcrumbList` em categorias e produtos
  - `Organization` no layout root
  - `WebSite` com sitelinks search box

### Técnico

- `sitemap.xml` dinâmico — lista produtos ativos COM fotos, categorias, páginas estáticas
- `robots.txt` permite tudo exceto `/admin`, `/api`, `?preview=true`
- URLs amigáveis: `/produto/nike-mercurial-vapor-elite-azul`
- Canonical em todas as páginas
- `hreflang="pt-BR"`
- **Indexação só de produtos ativos com pelo menos 1 foto** (evita páginas vazias)
- Redirect 301 quando slug muda (manter slugs antigos em tabela `SlugRedirect`)

### Conteúdo

- H1 único por página
- Alt obrigatório em todas as imagens
- Descrições com 150+ palavras quando possível

---

## 15. PERFORMANCE

### Metas

| Métrica | Alvo |
|---|---|
| LCP | < 2.0s |
| CLS | < 0.05 |
| INP | < 200ms |
| Lighthouse Performance | ≥ 95 |
| Lighthouse SEO | ≥ 95 |
| Lighthouse Acessibilidade | ≥ 95 |
| Lighthouse Boas Práticas | ≥ 95 |

### Como atingir

- **next/image** com `priority` no LCP, lazy no resto
- **AVIF + WebP** automáticos, qualidade 85, 3 tamanhos (thumb/médio/grande)
- **Sharp** processa imagens no upload (resize + compressão)
- **Server Components** padrão
- **Streaming + Suspense** em listas
- **ISR** com `revalidate = 3600` em catálogo
- **On-demand revalidation** quando admin edita produto (via `/api/revalidate`)
- **CDN do Supabase Storage** para imagens
- Fontes com `display: swap` + `preload`
- Bundle splitting automático
- Sem libs pesadas no client (moment.js, lodash → nativos)
- Critical CSS inline (Tailwind)
- **Skeleton screens** em vez de spinners

---

## 16. ANIMAÇÕES & LOADING

### Padrões Framer Motion

- **Entrada de seção**: `opacity 0→1`, `y: 20→0`, duration 0.5s, easeOut
- **Stagger** em listas de cards: 0.05s entre itens
- **Hover de cards**: zoom suave na imagem (`scale: 1.05`) + borda neon + glow, 0.3s
- **Promo bar**: AnimatePresence com slide vertical, troca a cada 4s
- **Hero**: fade + scale leve, Embla com autoplay e loop
- **Modais/Sheets**: spring `stiffness: 300, damping: 30`
- **Escudo no header**: hover gira 8° + glow neon
- **Botão WhatsApp flutuante**: pulse sutil a cada 5s para chamar atenção

### Loading

- **Skeleton screens** específicos por tipo de conteúdo (card, página de produto, lista, dashboard)
- **Loading screen inicial**: escudo grande pulsando neon (só se o JS demorar > 1s)
- Sem spinners genéricos

### Acessibilidade

- Respeitar `prefers-reduced-motion` em **todas** as animações
- Foco visível em todos os interativos (`outline: 2px solid var(--neon)`)

---

## 17. ACESSIBILIDADE

**Nível: WCAG 2.1 AA básico** (atende Lighthouse 95+).

- Contraste mínimo 4.5:1 (neon sobre preto passa)
- Navegação completa por teclado
- `aria-label` em ícones interativos
- `alt` descritivo em todas as imagens
- Skip link para o conteúdo principal
- Form labels associados aos inputs
- Estados de foco visíveis
- Respeitar `prefers-reduced-motion` e `prefers-color-scheme`
- `lang="pt-BR"` no `<html>`

---

## 18. LEGAL & LGPD

### Banner de cookies (LGPD)

- Aparece na primeira visita
- 2 botões: "Aceitar" / "Apenas essenciais"
- Recusar bloqueia: Meta Pixel, GA4, PostHog, Clarity
- Permanece: tracking interno (`/api/track`), Sentry
- Persiste decisão por 6 meses

### Política de Privacidade (`/privacidade`)

Conteúdo gerado do zero cobrindo:
- Dados coletados (anônimos de navegação, IP, user agent)
- Finalidade (melhorar experiência, analisar tráfego)
- Compartilhamento com terceiros (Google, Meta, Microsoft, Sentry — listados)
- Direitos do titular (LGPD): acesso, correção, exclusão, portabilidade, revogação
- Email de contato para solicitações
- Cookies usados (lista)
- Atualização da política

### Termos de Uso (`/termos`)

Conteúdo padrão adaptado cobrindo:
- O site é um catálogo, vendas são via WhatsApp
- Preços sujeitos a alteração sem aviso
- Disponibilidade confirmada no WhatsApp
- Limitação de responsabilidade
- Foro

---

## 19. EDGE CASES

| Cenário | Tratamento |
|---|---|
| Produto inativo acessado por URL antiga | Mostra produtos similares automaticamente + WhatsApp |
| Categoria sem produtos ativos | Estado vazio com sugestões de outras categorias |
| Busca sem resultados | CTA WhatsApp + produtos populares |
| Erro de carregamento de imagem | Placeholder com escudo |
| Erro 500 | Página `error.tsx` com escudo + WhatsApp |
| Erro de rede no tracking | Fail-silent, não bloqueia UX |
| Cliente sem JS | Página funciona (SSR) menos as interações (compare, cart) |
| Modo manutenção ativo | Middleware redireciona tudo para `/manutencao` |
| Cliente desativa cookies | Tracking interno continua, externos bloqueados |
| Cookie banner não respondido | Bloquear pixels até decisão |
| Sessão admin expira | Redirect para login com `?next=` |

---

## 20. VARIÁVEIS DE AMBIENTE

```env
# Site
NEXT_PUBLIC_SITE_URL=https://cariri-chuteiras.vercel.app
NEXT_PUBLIC_SITE_NAME="Cariri Chuteiras"
NEXT_PUBLIC_SITE_DESCRIPTION="A maior loja esportiva do Cariri"

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=5588XXXXXXXXX

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Analytics
NEXT_PUBLIC_CLARITY_PROJECT_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Email (relatórios PDF mensais)
RESEND_API_KEY=

# Admin
ADMIN_EMAIL_NOTIFICATIONS=
```

---

## 21. DEPLOY & INFRA

- **Vercel** conectado ao repo Git
- Branch `main` → produção
- Branch `dev` → preview
- PRs geram preview automático
- **Domínio inicial**: `cariri-chuteiras.vercel.app`
- **Domínio próprio** depois (a definir)
- Variáveis configuradas no Vercel + Supabase
- Cron Vercel para PDF mensal automático

### Checklist pré-lançamento

- [ ] Lighthouse ≥ 95 em mobile
- [ ] Imagens otimizadas (AVIF/WebP)
- [ ] Sitemap acessível
- [ ] OG image testado em opengraph.xyz
- [ ] Mensagem WhatsApp testada em iOS e Android
- [ ] Admin protegido (sem login redireciona)
- [ ] RLS validado (anônimo só lê dados públicos)
- [ ] Sentry recebendo erros
- [ ] Clarity gravando sessões
- [ ] Modo manutenção testado
- [ ] Cookie banner funcionando
- [ ] Compare e Cart persistindo no localStorage
- [ ] Acessibilidade básica (teclado, contraste, alt)

---

## 22. ROADMAP MODULAR — 18 MÓDULOS

> Cada módulo terá seu **prompt dedicado para o Claude Code**.
> Gerar **um por vez sob demanda** do Emmanuel.
> Ordem otimizada por dependências e por entregar valor cedo.

### FASE 1 — Fundação (módulos 1–3)

**Módulo 01 — Setup inicial + Design System + Database**
Next.js 14, TypeScript, Tailwind, shadcn/ui, ESLint, Prettier, estrutura de pastas, design tokens (preto + roxo neon), fontes Anton + Inter, componentes base (Button, Input, Badge, Card, Skeleton), Supabase + Prisma + schema completo + seed com produtos fictícios.

**Módulo 02 — Layout global**
Header com logo/escudo + busca + tema toggle + WhatsApp icon, Mobile menu (Sheet), Footer estilo Nike grande, Promo bar rotativa, Botão WhatsApp flutuante circular, Banner de cookies LGPD, Toggle de tema com persistência.

**Módulo 03 — Sistema de WhatsApp + Carrinho de intenção**
Store Zustand persistido, `buildWhatsappUrl`, botão flutuante com contador, drawer de carrinho, tracking via `/api/track`, mensagem dinâmica (1 ou N produtos).

### FASE 2 — Vitrine (módulos 4–9)

**Módulo 04 — Home**
Hero carrossel Foot Locker style, Grid de categorias, Produtos em destaque, Ranking de mais vendidos visual, Banner promocional com contador, Lançamentos, Strip de marcas, Depoimentos, Bloco WhatsApp CTA.

**Módulo 05 — Página de Produto (CRÍTICO)**
Galeria thumbs verticais + zoom lupa, Banner de urgência rotativo, Seletor de cor + numeração, Botão "Adicionar à conversa", Cupom destacado, Atributos extras, Descrição TipTap renderizada, Compartilhamento, Tabela de medidas, Avaliações, Produtos relacionados, Schema.org Product.

**Módulo 06 — Categoria + Filtros + Listagem**
Filtros laterais desktop / drawer mobile, Chip de filtros ativos, Ordenação, Paginação, URL sincronizada, Server Components com `useTransition`.

**Módulo 07 — Busca inteligente**
Componente cmdk, debounce, sugestões enquanto digita, produtos populares, histórico de buscas, CTA WhatsApp em zero-result.

**Módulo 08 — Comparador de produtos**
Store Zustand, bottom sticky bar, página `/comparar`, tabela horizontal, botão WhatsApp em massa.

**Módulo 09 — Páginas estáticas**
Quem Somos, Contato (com mapa), Promoções, Novidades, Privacidade, Termos, 404 com escudo pulsando, página de manutenção.

### FASE 3 — Conversão (módulos 10–11)

**Módulo 10 — Gatilhos de conversão**
Exit intent modal, Mensagens de urgência (X pessoas vendo, últimas X, vendido X vezes), Vistos recentemente (carrossel + dropdown header), Quick view em modal.

**Módulo 11 — Sistema de avaliações**
Formulário com moderação, exibição com filtros por estrelas, agregação no `Product.aggregateRating`, anti-spam (honeypot + IP hash).

### FASE 4 — Admin (módulos 12–16)

**Módulo 12 — Autenticação admin + Permissões + RLS**
Supabase Auth, middleware, tabela AdminUser, roles (admin/editor/viewer), RLS no Postgres, audit log trigger.

**Módulo 13 — CRUD de Produtos**
Listagem com bulk actions, formulário em abas, image uploader (drag & drop + sharp), variantes em matriz, editor TipTap, duplicar, preview, SKU automático.

**Módulo 14 — CRUD de Categorias + Cupons + Avaliações**
Categorias com reorder, Cupons com métricas, Moderação de avaliações.

**Módulo 15 — Dashboard Analytics**
KPIs, datepicker comparativo customizado, gráficos recharts com tema neon, funil, tabelas, exports CSV.

**Módulo 16 — Configurações + Usuários + Auditoria + Relatórios**
Configurações do site (promo bar, hero, contato, horário, modo manutenção), CRUD de usuários admin, visualização de auditoria, exports CSV + PDF mensal automático.

### FASE 5 — Polimento (módulos 17–18)

**Módulo 17 — Integrações analytics**
Microsoft Clarity, Meta Pixel, GA4, GTM, PostHog, Sentry — todas com respeito ao cookie banner.

**Módulo 18 — SEO + Performance + Acessibilidade final**
generateMetadata em todas as rotas, Schema.org completo, sitemap dinâmico, robots, Open Graph images, audit Lighthouse, ajustes de acessibilidade WCAG AA, otimização final de imagens, teste E2E do fluxo home → produto → WhatsApp.

---

## 23. COMANDOS & CONVENÇÕES

### Comandos

```bash
pnpm dev                    # desenvolvimento
pnpm build && pnpm start    # produção local
pnpm lint                   # eslint
pnpm typecheck              # tsc --noEmit
pnpm format                 # prettier

pnpm prisma migrate dev     # migrar
pnpm prisma studio          # GUI do banco
pnpm prisma db seed         # popular com dados fictícios
```

### Commits — Conventional Commits

- `feat:` nova funcionalidade
- `fix:` correção
- `style:` formatação
- `refactor:` refatoração
- `perf:` performance
- `docs:` documentação
- `chore:` build, deps, config

Exemplo: `feat(produto): adiciona zoom por lupa na galeria desktop`

### Estrutura de PR (quando aplicável)

- Branch a partir de `dev`
- Descrição: contexto, mudanças, screenshots, checklist
- Preview da Vercel automático

---

## 24. PRINCÍPIOS INEGOCIÁVEIS

1. **Foco número 1 é o clique no WhatsApp.** Qualquer trade-off entre "fofo" e "converte" → escolher converte.
2. **Mobile-first absoluto.** Desenhar para 375px primeiro, expandir para desktop depois.
3. **Performance é feature.** Cada componente novo é auditado para não quebrar o LCP.
4. **Identidade visual sagrada.** Preto + roxo neon + escudo central. Sem cores acessórias que não estejam na paleta.
5. **Componentes pequenos e reutilizáveis.** Se um arquivo passar de 200 linhas, dividir.
6. **TypeScript strict sempre.** Sem `any`, sem `@ts-ignore`.
7. **Server Components por padrão.** Client só quando necessário.
8. **Sem libs pesadas no client.** Antes de adicionar uma dependência, perguntar: dá pra fazer com o que já tem?
9. **Acessibilidade não é opcional.** WCAG AA é o piso.
10. **Cada módulo termina com:** build passando, lint passando, typecheck passando, e um exemplo de uso documentado no README de cada módulo.
11. **Ler este CLAUDE.md antes de TODO módulo.** Sempre. Especialmente a seção 2 (identidade visual) e a seção 8 (WhatsApp).
12. **Em caso de dúvida** sobre escopo ou design: parar e perguntar ao Emmanuel, não inferir.

---

## DADOS A PREENCHER NO LANÇAMENTO

> Esses campos são placeholders. Substituir antes do lançamento via painel admin (`/admin/configuracoes`):

- [ ] Número definitivo do WhatsApp
- [ ] Endereço da loja física
- [ ] @ Instagram
- [ ] @ TikTok
- [ ] URL embed do Google Maps
- [ ] Texto institucional "Quem Somos"
- [ ] Texto da Política de Privacidade (revisar e adaptar)
- [ ] Texto dos Termos de Uso (revisar e adaptar)
- [ ] Logos definitivos em `/public` (color, white, mono, escudo, favicon)
- [ ] Fotos da loja física (banner "Quem Somos")
- [ ] Slides do hero (5 com fotos, títulos, CTAs)
- [ ] Mensagens da promo bar (4–5 com emojis)

---

**FIM DO DOCUMENTO MESTRE.**
Próximo passo: gerar o prompt do **Módulo 01 — Setup inicial + Design System + Database** quando o Emmanuel pedir.
