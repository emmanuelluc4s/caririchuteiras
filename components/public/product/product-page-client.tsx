'use client'

import * as React from 'react'
import { VariantSelector, type Variant } from './variant-selector'
import { WhatsappAddBlock } from './whatsapp-add-block'
import { SizeChartModal } from './size-chart-modal'

type Props = {
  productId: string
  productName: string
  brand: string
  slug: string
  imageUrl?: string
  price: number
  promoPrice?: number
  variants: Variant[]
  categoryName: string
}

export function ProductPageClient({
  productId,
  productName,
  brand,
  slug,
  imageUrl,
  price,
  promoPrice,
  variants,
  categoryName,
}: Props) {
  // Pré-seleciona primeira variante com estoque
  const firstAvailable = variants.find((v) => v.stock > 0)

  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(
    firstAvailable?.color,
  )
  const [selectedSize, setSelectedSize] = React.useState<string | undefined>(
    firstAvailable?.size,
  )
  const [sizeChartOpen, setSizeChartOpen] = React.useState(false)

  function handleColorChange(color: string) {
    setSelectedColor(color)
    const sizesForColor = variants.filter((v) => v.color === color)
    const sameSize = sizesForColor.find(
      (v) => v.size === selectedSize && v.stock > 0,
    )
    if (!sameSize) {
      const firstSize =
        sizesForColor.find((v) => v.stock > 0) ?? sizesForColor[0]
      setSelectedSize(firstSize?.size)
    }
  }

  const selectedVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize,
  )
  const selectedHex = selectedVariant?.colorHex ?? undefined
  const stock = selectedVariant?.stock ?? 0

  const isShoe =
    categoryName.toLowerCase().includes('chuteira') ||
    categoryName.toLowerCase().includes('tênis') ||
    categoryName.toLowerCase().includes('tenis')

  return (
    <div className="space-y-6">
      <VariantSelector
        variants={variants}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        onColorChange={handleColorChange}
        onSizeChange={setSelectedSize}
        onOpenSizeChart={() => setSizeChartOpen(true)}
      />

      <WhatsappAddBlock
        product={{
          productId,
          productName,
          brand,
          slug,
          imageUrl,
          price,
          promoPrice,
        }}
        selectedColor={selectedColor}
        selectedColorHex={selectedHex}
        selectedSize={selectedSize}
        selectedVariantStock={stock}
        requiresSelection={variants.length > 0}
      />

      <SizeChartModal
        open={sizeChartOpen}
        onOpenChange={setSizeChartOpen}
        categoryType={isShoe ? 'shoe' : 'apparel'}
      />
    </div>
  )
}
