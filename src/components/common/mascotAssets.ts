export type MascotVariant =
  | 'main'
  | 'profileFront'
  | 'cheer'
  | 'greeting'
  | 'confirm'
  | 'sports'
  | 'music'
  | 'etc'
  | 'game'
  | 'movie'
  | 'controller'
  | 'thinking'
  | 'love'
  | 'bored'
  | 'angry'
  | 'crying'
  | 'surprised'
  | 'shy'
  | 'sleepy'
  | 'prayer'
  | 'explorer'
  | 'lookout'
  | 'treasureMap'
  | 'offering'
  | 'souvenir'
  | 'passport'
  | 'peace'
  | 'tea'
  | 'meditation'
  | 'food'
  | 'boat'
  | 'stoneStack'

export type MascotMiniVariant =
  | Exclude<
      MascotVariant,
      | 'main'
      | 'profileFront'
      | 'prayer'
      | 'sports'
      | 'music'
      | 'etc'
      | 'game'
      | 'movie'
      | 'controller'
      | 'explorer'
      | 'lookout'
      | 'treasureMap'
      | 'offering'
      | 'souvenir'
      | 'passport'
      | 'tea'
      | 'meditation'
      | 'food'
      | 'boat'
      | 'stoneStack'
    >
  | 'peace'

// Primary mascot assets use semantic names. Do not add numbered runtime paths.
// The *-mini files preserve the earlier 64px conversion output for compact
// fallback use only; normal UI should prefer the non-mini mascot files.
export const MASCOT_ASSETS: Record<MascotVariant, string> = {
  main: '/icons/mascot/mascot-main-full.webp',
  profileFront: '/icons/mascot/mascot-profile-front-full.webp',
  cheer: '/icons/mascot/mascot-cheer.webp',
  greeting: '/icons/mascot/mascot-greeting.webp',
  confirm: '/icons/mascot/mascot-confirm.webp',
  sports: '/icons/mascot/mascot-sports.webp',
  music: '/icons/mascot/mascot-music.webp',
  etc: '/icons/mascot/mascot-etc.webp',
  game: '/icons/mascot/mascot-game.webp',
  movie: '/icons/mascot/mascot-movie.webp',
  controller: '/icons/mascot/mascot-controller.webp',
  thinking: '/icons/mascot/mascot-thinking.webp',
  love: '/icons/mascot/mascot-love.webp',
  bored: '/icons/mascot/mascot-bored.webp',
  angry: '/icons/mascot/mascot-angry.webp',
  crying: '/icons/mascot/mascot-crying.webp',
  surprised: '/icons/mascot/mascot-surprised.webp',
  shy: '/icons/mascot/mascot-shy.webp',
  sleepy: '/icons/mascot/mascot-sleepy.webp',
  prayer: '/icons/mascot/mascot-prayer.webp',
  explorer: '/icons/mascot/mascot-explorer.webp',
  lookout: '/icons/mascot/mascot-lookout.webp',
  treasureMap: '/icons/mascot/mascot-treasure-map.webp',
  offering: '/icons/mascot/mascot-offering.webp',
  souvenir: '/icons/mascot/mascot-souvenir.webp',
  passport: '/icons/mascot/mascot-passport.webp',
  peace: '/icons/mascot/mascot-peace.webp',
  tea: '/icons/mascot/mascot-tea.webp',
  meditation: '/icons/mascot/mascot-meditation.webp',
  food: '/icons/mascot/mascot-food.webp',
  boat: '/icons/mascot/mascot-boat.webp',
  stoneStack: '/icons/mascot/mascot-stone-stack.webp',
}

export const MASCOT_MINI_ASSETS: Record<MascotMiniVariant, string> = {
  cheer: '/icons/mascot/mascot-cheer-mini.webp',
  greeting: '/icons/mascot/mascot-greeting-mini.webp',
  confirm: '/icons/mascot/mascot-confirm-mini.webp',
  thinking: '/icons/mascot/mascot-thinking-mini.webp',
  love: '/icons/mascot/mascot-love-mini.webp',
  bored: '/icons/mascot/mascot-bored-mini.webp',
  angry: '/icons/mascot/mascot-angry-mini.webp',
  crying: '/icons/mascot/mascot-crying-mini.webp',
  surprised: '/icons/mascot/mascot-surprised-mini.webp',
  shy: '/icons/mascot/mascot-shy-mini.webp',
  sleepy: '/icons/mascot/mascot-sleepy-mini.webp',
  peace: '/icons/mascot/mascot-peace-mini.webp',
}

export const APP_ICON_SOURCE = MASCOT_ASSETS.explorer

export const MAP_MARKER_ASSETS = {
  spot: '/icons/map-markers/spot.webp',
  current: '/icons/map-markers/current-location.webp',
  map: '/icons/map-markers/map.webp',
  popular: '/icons/map-markers/popular.webp',
} as const
