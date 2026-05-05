export interface RealSpotPhotoFallback {
  imageUrl: string
  sourcePageUrl: string
  license: string
}

export const REAL_SPOT_PHOTO_FALLBACKS: Record<string, RealSpotPhotoFallback> =
  {
    'REAL-ANI-001': {
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/5/52/Suga_Shrine_stairs_low-angle_20161113-071158.jpg',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Suga_Shrine_stairs_low-angle_20161113-071158.jpg',
      license: 'CC BY-SA 4.0',
    },
    'REAL-ANI-003': {
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/7/7f/Jiufen.jpg',
      sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Jiufen.jpg',
      license: 'CC BY 3.0',
    },
    'REAL-SPO-001': {
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/f/ff/Camp_Nou.jpg',
      sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Camp_Nou.jpg',
      license: 'CC BY 2.0',
    },
    'REAL-SPO-002': {
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/6/68/Old_Trafford_1.jpg',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Old_Trafford_1.jpg',
      license: 'Public domain',
    },
    'REAL-MOV-001': {
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/8/83/GlenfinnanViaduct.jpg',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:GlenfinnanViaduct.jpg',
      license: 'Public domain',
    },
    'REAL-MUS-001': {
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/c/ce/Abbey_Road_Crossing.jpg',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Abbey_Road_Crossing.jpg',
      license: 'CC BY 2.0',
    },
    'REAL-MUS-002': {
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/2/25/Tokyo_Dome.jpg',
      sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Tokyo_Dome.jpg',
      license: 'CC BY-SA 1.0',
    },
    'REAL-GAM-002': {
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/6/6a/Nintendo_Tokyo_%28PXL_20231220_022539971%29.jpg',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Nintendo_Tokyo_(PXL_20231220_022539971).jpg',
      license: 'CC BY 4.0',
    },
    'REAL-GAM-003': {
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/e/ec/Mega_Tokyo_Pok%C3%A9mon_Center_1.jpg',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Mega_Tokyo_Pok%C3%A9mon_Center_1.jpg',
      license: 'CC BY 3.0',
    },
    'REAL-ANI-010': {
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/d/d4/Outside_of_Akihabara.jpg',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Outside_of_Akihabara.jpg',
      license: 'CC BY-SA 4.0',
    },
  }
