export interface RealSpotPhotoFallback {
  imageUrl: string
  sourcePageUrl: string
  license: string
}

function wikimediaFilePath(fileName: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`
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
    'REAL-ANI-010': {
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/d/d4/Outside_of_Akihabara.jpg',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Outside_of_Akihabara.jpg',
      license: 'CC BY-SA 4.0',
    },
    'REAL-ANI-012': {
      imageUrl: wikimediaFilePath('Hakone-yumoto.jpg'),
      sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Hakone-yumoto.jpg',
      license: 'CC BY-SA 4.0',
    },
    'REAL-ANI-013': {
      imageUrl: wikimediaFilePath('Meiji Mura 20220718 04.jpg'),
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Meiji_Mura_20220718_04.jpg',
      license: 'CC BY-SA 4.0',
    },
    'REAL-ANI-014': {
      imageUrl: wikimediaFilePath('Oyama Dam.jpg'),
      sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Oyama_Dam.jpg',
      license: 'CC BY-SA 4.0',
    },
    'REAL-ANI-015': {
      imageUrl: wikimediaFilePath('Kumamoto Prefectural office new.jpg'),
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Kumamoto_Prefectural_office_new.jpg',
      license: 'CC BY-SA 4.0',
    },
    'REAL-ANI-016': {
      imageUrl: wikimediaFilePath('Haruna00.JPG'),
      sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Haruna00.JPG',
      license: 'CC BY-SA 3.0',
    },
    'REAL-ANI-017': {
      imageUrl: wikimediaFilePath('Kabukicho (53084208633).jpg'),
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Kabukicho_(53084208633).jpg',
      license: 'CC BY 2.0',
    },
    'REAL-ANI-018': {
      imageUrl: wikimediaFilePath('Naruto whirlpools 20170609-3.jpg'),
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Naruto_whirlpools_20170609-3.jpg',
      license: 'CC BY-SA 4.0',
    },
    'REAL-ANI-019': {
      imageUrl: wikimediaFilePath('Kuala Lumpur Tower.JPG'),
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Kuala_Lumpur_Tower.JPG',
      license: 'CC BY-SA 4.0',
    },
    'REAL-ANI-020': {
      imageUrl: wikimediaFilePath('Shibuya Scramble crossing.jpg'),
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Shibuya_Scramble_crossing.jpg',
      license: 'CC0 1.0',
    },
    'REAL-ANI-021': {
      imageUrl: wikimediaFilePath('Shibuya 109 -01.jpg'),
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Shibuya_109_-01.jpg',
      license: 'CC BY-SA 3.0',
    },
    'REAL-ANI-022': {
      imageUrl: wikimediaFilePath('Lake Motosu (2015-12-17).jpg'),
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Lake_Motosu_(2015-12-17).jpg',
      license: 'CC BY-SA 4.0',
    },
    'REAL-ANI-023': {
      imageUrl: wikimediaFilePath('Shimokitazawa.jpg'),
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Shimokitazawa.jpg',
      license: 'CC BY-SA 4.0',
    },
    'REAL-ANI-024': {
      imageUrl: wikimediaFilePath('Nuremberg old town nov 2020.jpg'),
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Nuremberg_old_town_nov_2020.jpg',
      license: 'CC BY-SA 4.0',
    },
    'REAL-ANI-025': {
      imageUrl: wikimediaFilePath('Saitama stadium2002-1.jpg'),
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Saitama_stadium2002-1.jpg',
      license: 'CC BY-SA 3.0',
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
    'REAL-SPO-004': {
      imageUrl: wikimediaFilePath('Santiago Bernabeu Stadium.jpg'),
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Santiago_Bernabeu_Stadium.jpg',
      license: 'CC BY-SA 4.0',
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
    'REAL-MUS-006': {
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/%EC%98%AC%EB%A6%BC%ED%94%BD%EC%B2%B4%EC%A1%B0.jpg',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:%EC%98%AC%EB%A6%BC%ED%94%BD%EC%B2%B4%EC%A1%B0.jpg',
      license: 'CC BY-SA 4.0',
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
  }
