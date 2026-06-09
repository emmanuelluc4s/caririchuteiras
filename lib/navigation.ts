export type NavItem = {
  label: string
  href: string
  highlight?: boolean
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Chuteiras', href: '/categoria/chuteiras-society' },
  { label: 'Camisas', href: '/categoria/camisas-de-times' },
  { label: 'Academia', href: '/categoria/roupas-de-academia' },
  { label: 'Tênis', href: '/categoria/tenis-esportivos' },
  { label: 'Promoções', href: '/promocoes', highlight: true },
  { label: 'Novidades', href: '/novidades' },
  { label: 'Contato', href: '/contato' },
]

export const FOOTER_NAV = {
  categorias: [
    { label: 'Chuteiras Society', href: '/categoria/chuteiras-society' },
    { label: 'Chuteiras Campo', href: '/categoria/chuteiras-campo' },
    { label: 'Chuteiras Futsal', href: '/categoria/chuteiras-futsal' },
    { label: 'Tênis Esportivos', href: '/categoria/tenis-esportivos' },
    { label: 'Camisas de Times', href: '/categoria/camisas-de-times' },
    { label: 'Roupas de Academia', href: '/categoria/roupas-de-academia' },
    { label: 'Acessórios', href: '/categoria/acessorios' },
  ],
  sobre: [
    { label: 'Quem Somos', href: '/quem-somos' },
    { label: 'Promoções', href: '/promocoes' },
    { label: 'Novidades', href: '/novidades' },
    { label: 'Marcas', href: '/marcas' },
  ],
  atendimento: [
    { label: 'Fale Conosco', href: '/contato' },
    { label: 'Política de Privacidade', href: '/privacidade' },
    { label: 'Termos de Uso', href: '/termos' },
  ],
} as const
