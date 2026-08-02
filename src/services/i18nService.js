// Internationalization Service - Multi-language support
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文'
};

export const TRANSLATIONS = {
  en: {
    // Navigation
    void: 'Void',
    echo: 'Echo',
    cast: 'Cast',
    scream: 'Scream',
    shadow: 'Shadow',

    // Auth
    enterVoid: 'ENTER THE VOID',
    manifestShadow: 'MANIFEST YOUR SHADOW',
    email: 'Email',
    password: 'Password',
    name: 'Your Name',
    login: 'ENTER VOID',
    signup: 'MANIFEST',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    haveAccount: 'Already a shadow?',
    exitVoid: 'EXIT THE VOID',

    // Common
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    save: 'SAVE',
    cancel: 'CANCEL',
    delete: 'DELETE',
    edit: 'EDIT',
    settings: 'SETTINGS',
    profile: 'PROFILE',
    logout: 'LOGOUT',

    // Screens
    discoverEchoes: 'Discover echoes from the darkness',
    searchCreators: 'Search creators...',
    createContent: 'Create & Stream',
    liveNow: 'NOW ECHOING',
    recentEchoes: 'RECENT ECHOES',
    followers: 'followers',
    views: 'views',
    likes: 'likes',

    // Notifications
    pushNotifications: 'Push Notifications',
    creatorLive: 'Creator Goes Live',
    newContent: 'New Content',
    chatMentions: 'Chat Mentions',
    tributes: 'Tributes Received'
  },
  es: {
    void: 'Vacío',
    echo: 'Eco',
    cast: 'Transmitir',
    scream: 'Grito',
    shadow: 'Sombra',
    enterVoid: 'ENTRA AL VACÍO',
    manifestShadow: 'MANIFIESTA TU SOMBRA',
    email: 'Correo',
    password: 'Contraseña',
    name: 'Tu Nombre',
    login: 'ENTRA',
    signup: 'MANIFIESTA',
    forgotPassword: '¿Olvidaste la contraseña?',
    success: 'Éxito',
    error: 'Error',
    loading: 'Cargando...',
    save: 'GUARDAR',
    cancel: 'CANCELAR',
    settings: 'CONFIGURACIÓN',
    profile: 'PERFIL',
    logout: 'CERRAR SESIÓN'
  },
  fr: {
    void: 'Vide',
    echo: 'Écho',
    cast: 'Diffusion',
    scream: 'Cri',
    shadow: 'Ombre',
    enterVoid: 'ENTREZ DANS LE VIDE',
    manifestShadow: 'MANIFESTEZ VOTRE OMBRE',
    email: 'Email',
    password: 'Mot de passe',
    name: 'Votre Nom',
    login: 'ENTREZ',
    signup: 'MANIFESTEZ',
    success: 'Succès',
    error: 'Erreur',
    loading: 'Chargement...',
    save: 'ENREGISTRER',
    cancel: 'ANNULER',
    settings: 'PARAMÈTRES',
    profile: 'PROFIL',
    logout: 'DÉCONNEXION'
  },
  de: {
    void: 'Leere',
    echo: 'Echo',
    cast: 'Übertragung',
    scream: 'Schrei',
    shadow: 'Schatten',
    enterVoid: 'BETRETEN SIE DIE LEERE',
    email: 'E-Mail',
    password: 'Passwort',
    name: 'Dein Name',
    success: 'Erfolg',
    error: 'Fehler',
    loading: 'Wird geladen...',
    save: 'SPEICHERN',
    cancel: 'ABBRECHEN',
    settings: 'EINSTELLUNGEN',
    profile: 'PROFIL',
    logout: 'ABMELDEN'
  },
  ja: {
    void: 'ボイド',
    echo: 'エコー',
    cast: 'キャスト',
    scream: 'スクリーム',
    shadow: 'シャドウ',
    email: 'メール',
    password: 'パスワード',
    name: 'あなたの名前',
    success: '成功',
    error: 'エラー',
    loading: '読み込み中...',
    save: '保存',
    cancel: 'キャンセル',
    settings: '設定',
    profile: 'プロフィール',
    logout: 'ログアウト'
  },
  pt: {
    void: 'Vazio',
    echo: 'Eco',
    cast: 'Transmissão',
    scream: 'Grito',
    shadow: 'Sombra',
    email: 'Email',
    password: 'Senha',
    name: 'Seu Nome',
    success: 'Sucesso',
    error: 'Erro',
    loading: 'Carregando...',
    save: 'SALVAR',
    cancel: 'CANCELAR',
    settings: 'CONFIGURAÇÕES',
    profile: 'PERFIL',
    logout: 'SAIR'
  },
  ru: {
    void: 'Пустота',
    echo: 'Эхо',
    cast: 'Трансляция',
    scream: 'Крик',
    shadow: 'Тень',
    email: 'Почта',
    password: 'Пароль',
    name: 'Ваше имя',
    success: 'Успех',
    error: 'Ошибка',
    loading: 'Загрузка...',
    save: 'СОХРАНИТЬ',
    cancel: 'ОТМЕНА',
    settings: 'ПАРАМЕТРЫ',
    profile: 'ПРОФИЛЬ',
    logout: 'ВЫХОД'
  },
  zh: {
    void: '虚空',
    echo: '回响',
    cast: '播放',
    scream: '尖叫',
    shadow: '影子',
    email: '邮箱',
    password: '密码',
    name: '你的名字',
    success: '成功',
    error: '错误',
    loading: '加载中...',
    save: '保存',
    cancel: '取消',
    settings: '设置',
    profile: '个人资料',
    logout: '登出'
  }
};

export const t = (key, language = 'en') => {
  if (TRANSLATIONS[language] && TRANSLATIONS[language][key]) {
    return TRANSLATIONS[language][key];
  }
  // Fallback to English
  return TRANSLATIONS.en[key] || key;
};

export const getCurrentLanguage = async (userId) => {
  try {
    // In real app, fetch from Firestore user preferences
    return 'en'; // Default to English
  } catch (error) {
    console.error('◉ Get language failed:', error);
    return 'en';
  }
};

export const setUserLanguage = async (userId, language) => {
  try {
    // In real app, save to Firestore user preferences
    if (!SUPPORTED_LANGUAGES[language]) {
      return { success: false, error: 'Language not supported' };
    }
    return { success: true, language: language };
  } catch (error) {
    console.error('◉ Set language failed:', error);
    return { success: false, error: error.message };
  }
};
