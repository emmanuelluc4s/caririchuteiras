'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { saveProductAction } from '@/app/admin/(authenticated)/produtos/actions'
import type {
  ProductFormValues,
  ImageValues,
  VariantValues,
} from '@/lib/admin/products/schema'
import { ProductGeneralTab } from './product-general-tab'
import { ProductImagesTab } from './product-images-tab'
import { ProductVariantsTab } from './product-variants-tab'
import { ProductAttributesTab } from './product-attributes-tab'
import { ProductSeoTab } from './product-seo-tab'

type InitialData = ProductFormValues & { id: string }

type Props = {
  categories: Array<{ id: string; name: string }>
  initialData?: InitialData
}

const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  slug: '',
  sku: '',
  brand: '',
  categoryId: '',
  price: 0,
  promoPrice: null,
  installments: 1,
  installmentFree: false,
  description: '',
  isActive: true,
  isNew: false,
  isBestSellerManual: false,
  material: null,
  weight: null,
  collar: null,
  technology: null,
  useIndication: null,
  warranty: null,
  origin: null,
  metaTitle: null,
  metaDescription: null,
  images: [],
  variants: [],
}

export function ProductForm({ categories, initialData }: Props) {
  const router = useRouter()
  const isEditing = Boolean(initialData)
  const [values, setValues] = React.useState<ProductFormValues>(
    initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          sku: initialData.sku,
          brand: initialData.brand,
          categoryId: initialData.categoryId,
          price: initialData.price,
          promoPrice: initialData.promoPrice,
          installments: initialData.installments,
          installmentFree: initialData.installmentFree,
          description: initialData.description,
          isActive: initialData.isActive,
          isNew: initialData.isNew,
          isBestSellerManual: initialData.isBestSellerManual,
          material: initialData.material,
          weight: initialData.weight,
          collar: initialData.collar,
          technology: initialData.technology,
          useIndication: initialData.useIndication,
          warranty: initialData.warranty,
          origin: initialData.origin,
          metaTitle: initialData.metaTitle,
          metaDescription: initialData.metaDescription,
          images: initialData.images,
          variants: initialData.variants,
        }
      : DEFAULT_VALUES,
  )
  const [saving, setSaving] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('geral')
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  function patch(partial: Partial<ProductFormValues>) {
    setValues((prev) => ({ ...prev, ...partial }))
  }
  function setImages(images: ImageValues[]) {
    setValues((prev) => ({ ...prev, images }))
  }
  function setVariants(variants: VariantValues[]) {
    setValues((prev) => ({ ...prev, variants }))
  }

  async function handleSave() {
    setSaving(true)
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!values.name) newErrors.name = 'Nome obrigatório'
    if (!values.sku) newErrors.sku = 'SKU obrigatório'
    if (!values.brand) newErrors.brand = 'Marca obrigatória'
    if (!values.categoryId) newErrors.categoryId = 'Categoria obrigatória'
    if (values.price <= 0) newErrors.price = 'Preço inválido'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setActiveTab('geral')
      toast.error('Corrija os campos obrigatórios')
      setSaving(false)
      return
    }

    const result = await saveProductAction(initialData?.id ?? null, values)
    setSaving(false)

    if (result.ok && result.data) {
      toast.success(isEditing ? 'Produto atualizado!' : 'Produto criado!', {
        description: `Slug: /${result.data.slug}`,
      })
      if (!isEditing) {
        router.push(`/admin/produtos/${result.data.id}/editar`)
      } else {
        router.refresh()
      }
    } else if (!result.ok) {
      toast.error(result.error)
    }
  }

  const hasGeneralErrors = Boolean(
    errors.name ||
      errors.sku ||
      errors.brand ||
      errors.categoryId ||
      errors.price,
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/produtos" aria-label="Voltar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl uppercase tracking-tight md:text-3xl">
              {isEditing ? values.name || 'Editar produto' : 'Novo produto'}
            </h1>
            {isEditing && initialData && (
              <Link
                href={`/produto/${initialData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-neon hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Ver no site
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/produtos">Cancelar</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar produto'}
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-bg-secondary md:grid-cols-5">
          <TabsTrigger
            value="geral"
            className="relative data-[state=active]:bg-bg-tertiary"
          >
            Geral
            {hasGeneralErrors && (
              <AlertCircle className="absolute right-1 top-1 h-3 w-3 text-danger" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="imagens"
            className="data-[state=active]:bg-bg-tertiary"
          >
            Imagens
            <span className="ml-1.5 text-[9px] text-gray-400">
              ({values.images.length})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="variantes"
            className="data-[state=active]:bg-bg-tertiary"
          >
            Variantes
            <span className="ml-1.5 text-[9px] text-gray-400">
              ({values.variants.length})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="atributos"
            className="hidden data-[state=active]:bg-bg-tertiary md:flex"
          >
            Atributos
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="hidden data-[state=active]:bg-bg-tertiary md:flex"
          >
            SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-6">
          <ProductGeneralTab
            values={values}
            categories={categories}
            errors={errors}
            isEditing={isEditing}
            productId={initialData?.id}
            onChange={patch}
          />
        </TabsContent>
        <TabsContent value="imagens" className="mt-6">
          <ProductImagesTab
            images={values.images}
            productId={initialData?.id}
            onChange={setImages}
          />
        </TabsContent>
        <TabsContent value="variantes" className="mt-6">
          <ProductVariantsTab
            variants={values.variants}
            onChange={setVariants}
          />
        </TabsContent>
        <TabsContent value="atributos" className="mt-6">
          <ProductAttributesTab values={values} onChange={patch} />
        </TabsContent>
        <TabsContent value="seo" className="mt-6">
          <ProductSeoTab values={values} onChange={patch} />
        </TabsContent>
      </Tabs>

      <footer className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-bg-primary px-4 pb-2 pt-4">
        <Button variant="outline" asChild>
          <Link href="/admin/produtos">Cancelar</Link>
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar produto'}
        </Button>
      </footer>
    </div>
  )
}
