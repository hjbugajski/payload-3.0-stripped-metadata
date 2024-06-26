import { parse } from 'exifr'
import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

export const useExif: CollectionAfterChangeHook<any> = async ({
  context,
  doc,
  operation,
  req: { payload },
}) => {
  if (operation === 'update' || context?.ignoreUseExif || !doc.url) {
    return
  }

  const image = await fetch(doc.url)
  const imageBuffer = await image.arrayBuffer()
  const metadata = await parse(imageBuffer, { mergeOutput: false })

  await payload.update({
    collection: 'media',
    id: doc.id,
    data: {
      metadata,
    },
    context: {
      ignoreUseExif: true,
    },
  })
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [useExif],
  },
  upload: {
    mimeTypes: ['image/*'],
    // uncomment imageSize to demo metadata being stripped
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
      },
    ],
  },
  fields: [
    {
      name: 'metadata',
      type: 'json',
      admin: {
        readOnly: true,
      },
    },
  ],
}
