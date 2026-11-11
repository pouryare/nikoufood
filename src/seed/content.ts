/**
 * Starter content for the CMS (Persian). Everything here is an editable first draft:
 * wording follows the project brief, unknown facts are left empty or generic.
 * No invented statistics, testimonials or addresses.
 */

export const siteSettings = {
  brandName: 'نیکو اعتماد',
  brandNameLatin: 'NIKOU',
  legalName: 'شرکت نیکو اعتماد پارس پیام',
  tagline: 'تجربه، کیفیت و شبکه‌ای پایدار برای حضور مؤثر در بازار',
  description:
    'نیکو اعتماد، تولیدکننده و توزیع‌کنندهٔ کره و چربی‌های خوراکی با حدود ۱۵ سال سابقه؛ دفتر مرکزی در تهران، پخش مستقیم در تهران و شبکهٔ نمایندگی در سراسر ایران.',
  yearsOfExperience: 15,
  rebrandYear: '۱۴۰۴',
  address: 'تهران، ایران',
  articlesVisibility: 'auto' as const,
  enable3D: true,
  showWhatsappButton: true,
  footerText: 'شرکت نیکو اعتماد پارس پیام؛ تولید، تأمین و توزیع کره و چربی‌های خوراکی در سراسر ایران.',
  copyright: '© شرکت نیکو اعتماد پارس پیام. تمامی حقوق محفوظ است.',
}

export const navigation = {
  header: [
    { label: 'درباره ما', href: '/about' },
    { label: 'محصولات', href: '/products' },
    { label: 'برندها', href: '/brands' },
    { label: 'شبکه توزیع', href: '/network' },
    { label: 'همکاری با ما', href: '/partnership' },
    { label: 'مقالات', href: '/articles' },
    { label: 'تماس با ما', href: '/contact' },
  ],
  headerCta: { label: 'درخواست نمایندگی', href: '/representation' },
  footerColumns: [
    {
      title: 'شرکت',
      links: [
        { label: 'درباره ما', href: '/about' },
        { label: 'برندها', href: '/brands' },
        { label: 'مقالات', href: '/articles' },
      ],
    },
    {
      title: 'محصولات',
      links: [
        { label: 'همهٔ محصولات', href: '/products' },
        { label: 'تک‌نفره', href: '/products?category=single-serve' },
        { label: 'فله‌ای', href: '/products?category=bulk' },
      ],
    },
    {
      title: 'همکاری',
      links: [
        { label: 'شبکهٔ توزیع و نمایندگی', href: '/network' },
        { label: 'درخواست نمایندگی', href: '/representation' },
        { label: 'همکاری با ما', href: '/partnership' },
      ],
    },
    { title: 'ارتباط', links: [{ label: 'تماس با ما', href: '/contact' }] },
  ],
}

export const homePage = {
  hero: {
    eyebrow: 'تولید، تأمین و توزیع · از تهران تا سراسر ایران',
    wordTop: 'طعمِ',
    wordMiddle: 'خالصِ',
    wordBottom: 'اعتماد',
    subtitle:
      'نیکو اعتماد؛ حدود ۱۵ سال تجربه در تولید و توزیع کره و چربی‌های خوراکی، با پخش مستقیم در تهران و شبکهٔ نمایندگی در سراسر ایران.',
    primaryCta: { label: 'درخواست نمایندگی', href: '/representation' },
    secondaryCta: { label: 'آشنایی با محصولات', href: '/products' },
  },
  film: {
    enabled: true,
    eyebrow: 'از مزرعه تا سفره',
    title: 'کره، پیش از آن‌که به سفره برسد',
    intro: 'هر کره داستانی دارد: یکی از دانه شروع می‌شود و دیگری از شیر. جایی که مسیرشان یکی است، یک تصویر می‌بینید؛ جایی که فرق دارند، صفحه دو نیمه می‌شود.',
    plantLabel: 'کرهٔ گیاهی',
    animalLabel: 'کرهٔ حیوانی',
    scenes: [
      {
        layout: 'single',
        kicker: 'مزرعه',
        single: { title: 'همه‌چیز از زمین شروع می‌شود', text: 'دانه‌های روغنی زیر آفتاب می‌رسند و گاوها در مرتع می‌چرند؛ دو مسیر متفاوت، با یک نقطهٔ شروع.', art: 'farm', picture: { file: 'film-farm.webp', alt: 'مزرعهٔ آفتابگردان و گاوهای شیری در مرتع هنگام غروب', focal: [10, 50] }, pictureMobile: { file: 'film-farm-phone.webp', alt: 'گل‌های آفتابگردان و گاوهای شیری در مرتع هنگام غروب', focal: [50, 30] } },
      },
      {
        layout: 'split',
        kicker: 'دانه | شیر',
        plant: { title: 'دانه، پاک و آماده', text: 'دانه‌ها پس از برداشت بوجاری و پوست‌گیری می‌شوند تا فقط مغز سالم باقی بماند.', art: 'seed', picture: { file: 'film-seed.webp', alt: 'گل آفتابگردانِ رسیده و دانه‌های آفتابگردان', focal: [10, 67] } },
        animal: { title: 'شیر، تازه و سرد', text: 'شیر پس از دوشش بلافاصله تا حدود ۴ درجه سرد و پیش از ورود به خط تولید آزمایش می‌شود.', art: 'milk', picture: { file: 'film-milk.webp', alt: 'شیر تازه که در پارچ شیشه‌ای ریخته می‌شود', focal: [70, 92] } },
      },
      {
        layout: 'split',
        kicker: 'روغن | خامه',
        plant: { title: 'روغن، زلال و روشن', text: 'روغن با پرس از دانه گرفته و در چند مرحله تصفیه می‌شود تا زلال، روشن و بی‌بو شود.', art: 'oil', picture: { file: 'film-oil.webp', alt: 'روغن طلایی آفتابگردان که در کاسهٔ شیشه‌ای ریخته می‌شود', focal: [80, 83] } },
        animal: { title: 'خامه، چربیِ شیر', text: 'دستگاه خامه‌گیر خامه را از شیر جدا می‌کند و خامه پاستوریزه می‌شود.', art: 'cream', picture: { file: 'film-cream.webp', alt: 'خامهٔ غلیظ در کاسه', focal: [60, 78] } },
      },
      {
        layout: 'single',
        kicker: 'کره',
        single: { title: 'این‌جا مسیرها به هم می‌رسند', text: 'چه از روغن باشد چه از خامه، کره پاستوریزه، سرد و ورز داده می‌شود تا بافتی نرم و یکدست پیدا کند.', art: 'butter', picture: { file: 'film-butter.webp', alt: 'قالب کرهٔ طلایی بدون بسته‌بندی', focal: [100, 55] }, pictureMobile: { file: 'film-butter-phone.webp', alt: 'قالب کرهٔ طلایی بدون بسته‌بندی', focal: [50, 93] } },
      },
      {
        layout: 'single',
        kicker: 'سفره',
        single: { title: 'و سرانجام، روی برنج داغ', text: 'برای چلو، کباب و جوجه؛ همان لحظه‌ای که طعم کامل می‌شود.', art: 'table', picture: { file: 'film-table.webp', alt: 'چلو با کره، کباب کوبیده و جوجه‌کباب روی سفرهٔ ایرانی', focal: [90, 55] }, pictureMobile: { file: 'film-table-phone.webp', alt: 'چلو با کره، کباب کوبیده و جوجه‌کباب روی سفرهٔ ایرانی', focal: [50, 58] } },
      },
    ],
  },
  intro: {
    eyebrow: 'دربارهٔ نیکو اعتماد',
    title: 'تجربهٔ یک مجموعهٔ باسابقه، با نگاهی تازه',
    text: 'نیکو اعتماد حدود ۱۵ سال است در صنعت محصولات غذایی فعالیت می‌کند. در سال ۱۴۰۴ هویت و ساختار جدید خود را معرفی کرد تا با نگاهی مدرن‌تر، برندها و شبکهٔ توزیعش را در سراسر ایران گسترش دهد.',
    highlights: [
      { value: '۱۵', label: 'سال سابقهٔ فعالیت' },
      { value: '۱۴۰۴', label: 'آغاز هویت جدید' },
      { value: 'سراسر ایران', label: 'محدودهٔ فعالیت' },
    ],
    cta: { label: 'بیشتر دربارهٔ ما', href: '/about' },
  },
  products: {
    eyebrow: 'محصولات',
    title: 'کره و چربی‌های خوراکی، برای هر نیاز',
    text: 'از بستهٔ تک‌نفره برای رستوران‌ها و کترینگ‌ها تا بستهٔ فله‌ای برای مراکز تهیهٔ غذا و پخش‌کنندگان.',
    ctaLabel: 'مشاهدهٔ همهٔ محصولات',
    showMarkets: true,
  },
  brands: {
    eyebrow: 'برندها',
    title: 'دو برند، یک استاندارد',
    text: 'آلانیک و پاک‌خواه، برندهای متعلق به مجموعهٔ نیکو اعتماد هستند.',
  },
  distribution: {
    eyebrow: 'شبکهٔ توزیع',
    title: 'دو مدل حضور، یک هدف: دسترسی مطمئن',
    text: 'در تهران محصولات به‌صورت مستقیم پخش می‌شوند و در سایر استان‌ها، نمایندگان و پخش‌کنندگان منطقه‌ای مسئول فروش و توزیع‌اند.',
    tehranTitle: 'تهران: پخش مستقیم',
    tehranText: 'توزیع مستقیم محصولات در تهران از طریق شرکت طعمینو انجام می‌شود.',
    provincesTitle: 'سایر استان‌ها: شبکهٔ نمایندگی',
    provincesText: 'نمایندگان و پخش‌کنندگان منطقه‌ای، محصولات را در شهر و استان خود عرضه می‌کنند.',
  },
  map: {
    eyebrow: 'گسترهٔ فعالیت',
    title: 'حضور در سراسر ایران',
    text: 'وضعیت پوشش هر استان روی نقشه نمایش داده می‌شود.',
    ctaLabel: 'مشاهدهٔ شبکهٔ نمایندگی',
  },
  trust: {
    eyebrow: 'چرا نیکو اعتماد',
    title: 'اعتماد، از ساختار شروع می‌شود',
    items: [
      { title: 'سابقهٔ فعالیت', text: 'حدود ۱۵ سال تجربه در صنعت محصولات غذایی.', icon: 'award' },
      { title: 'شبکهٔ توزیع', text: 'پخش مستقیم در تهران و نمایندگی در سایر مناطق ایران.', icon: 'truck' },
      { title: 'کیفیت', text: 'تمرکز بر ثبات محصول و بسته‌بندی، برای مصرف‌کنندگان حرفه‌ای.', icon: 'shield' },
      { title: 'پشتیبانی', text: 'همراهی تیم نیکو اعتماد با نمایندگان و همکاران تجاری.', icon: 'headset' },
      { title: 'همکاری با کسب‌وکارها', text: 'رستوران‌ها، هتل‌ها، کترینگ‌ها و عمده‌فروشان.', icon: 'building' },
    ],
  },
  finalCta: {
    title: 'برای همکاری، از اینجا شروع کنید',
    text: 'چه نماینده و پخش‌کنندهٔ منطقه‌ای باشید، چه عمده‌فروش یا کسب‌وکار غذایی، تیم ما آمادهٔ گفت‌وگوست.',
    primary: { label: 'درخواست نمایندگی', href: '/representation' },
    secondary: { label: 'همکاری با ما', href: '/partnership' },
    tertiary: { label: 'تماس با نیکو اعتماد', href: '/contact' },
  },
}

export const aboutPage = {
  header: {
    eyebrow: 'درباره ما',
    title: 'نیکو اعتماد؛ تجربه‌ای که با هویتی تازه ادامه می‌یابد',
    intro: 'حدود ۱۵ سال فعالیت در صنعت محصولات غذایی، و فصلی تازه که از سال ۱۴۰۴ آغاز شد.',
  },
  chapters: [
    {
      kicker: 'سابقه',
      title: 'حدود ۱۵ سال تجربه در بازار',
      text: 'نیکو اعتماد در طول سال‌ها در تولید، تأمین، بازرگانی و توزیع محصولات غذایی تجربه اندوخته و ارتباط پایدار با شبکهٔ فروش ساخته است.',
    },
    {
      kicker: 'ری‌برند ۱۴۰۴',
      title: 'هویت تازه، ساختار منظم‌تر',
      text: 'در سال ۱۴۰۴ برند و هویت نیکو اعتماد بازتعریف شد تا با ساختاری سازمان‌یافته و نگاهی مدرن، مسیر رشد بعدی را بسازد.',
    },
    {
      kicker: 'امروز',
      title: 'تولیدکننده، مالک برند و توزیع‌کننده',
      text: 'نیکو اعتماد مالک برندهای آلانیک و پاک‌خواه است و محصولات خود را در تهران به‌صورت مستقیم و در سایر استان‌ها از طریق نمایندگان عرضه می‌کند.',
    },
    {
      kicker: 'آینده',
      title: 'ساختاری آمادهٔ توسعه',
      text: 'برند، دسته‌بندی و محصول تازه به‌سادگی به این مجموعه اضافه می‌شود و شبکهٔ توزیع نیز گام‌به‌گام در استان‌های بیشتری گسترش می‌یابد.',
    },
  ],
  milestones: [
    { year: 'حدود ۱۵ سال پیش', title: 'آغاز فعالیت', text: 'شروع کار در صنعت محصولات غذایی.' },
    { year: '۱۴۰۴', title: 'ری‌برند', text: 'معرفی هویت و ساختار جدید نیکو اعتماد.' },
  ],
  vision: {
    title: 'چشم‌انداز',
    text: 'ساختن شبکه‌ای پایدار از برندها، محصولات و همکاران تجاری که حضور مؤثر در بازار غذایی ایران را ممکن می‌کند.',
  },
  values: [
    { title: 'اعتماد', text: 'شفافیت و پایبندی در همکاری با شبکهٔ فروش و مشتریان.' },
    { title: 'کیفیت', text: 'ثبات در محصول و بسته‌بندی، از تولید تا توزیع.' },
    { title: 'توسعه', text: 'رشد پایدار برندها و شبکهٔ توزیع در سراسر ایران.' },
  ],
  cta: {
    title: 'با ما همکاری کنید',
    text: 'اگر در شهر یا استان خود توان فروش و توزیع دارید، درخواست نمایندگی ثبت کنید.',
    primary: { label: 'درخواست نمایندگی', href: '/representation' },
  },
}

export const networkPage = {
  header: {
    eyebrow: 'شبکهٔ توزیع و نمایندگی',
    title: 'شبکه‌ای که محصول را به هر شهر می‌رساند',
    intro: 'پخش مستقیم در تهران، و نمایندگان و پخش‌کنندگان منطقه‌ای در سایر استان‌ها.',
  },
  tehran: {
    title: 'تهران: پخش مستقیم',
    text: 'در تهران، محصولات نیکو اعتماد به‌صورت مستقیم و از طریق شرکت طعمینو توزیع می‌شوند.',
    partnerName: 'طعمینو',
  },
  provinces: {
    title: 'سایر استان‌ها: نمایندگان و پخش‌کنندگان منطقه‌ای',
    text: 'در سایر نقاط ایران، نمایندگان و پخش‌کنندگان منطقه‌ای مسئول فروش و توزیع محصولات در منطقهٔ خود هستند.',
  },
  map: { eyebrow: 'نقشهٔ ایران', title: 'وضعیت پوشش استان‌ها', text: 'روی هر استان بروید تا وضعیت آن را ببینید.' },
  legend: [
    { status: 'direct', label: 'پخش مستقیم' },
    { status: 'covered', label: 'تحت پوشش نماینده' },
    { status: 'open', label: 'پذیرش درخواست نمایندگی' },
    { status: 'soon', label: 'به‌زودی' },
  ],
  steps: [
    { title: 'ثبت درخواست', text: 'فرم کوتاه نمایندگی را پر کنید.' },
    { title: 'بررسی', text: 'کارشناسان نیکو اعتماد درخواست شما را بررسی می‌کنند.' },
    { title: 'گفت‌وگو', text: 'در صورت نیاز، با شما تماس گرفته می‌شود.' },
    { title: 'آغاز همکاری', text: 'پس از تأیید، همکاری رسمی آغاز می‌شود.' },
  ],
  faq: [
    { question: 'چه کسانی می‌توانند نماینده شوند؟', answer: 'اشخاص و شرکت‌هایی که توان فروش و توزیع محصولات را در منطقهٔ خود دارند.' },
    {
      question: 'پس از ثبت درخواست چه می‌شود؟',
      answer: 'اطلاعات شما بررسی می‌شود و در صورت نیاز، کارشناسان نیکو اعتماد با شما تماس می‌گیرند.',
    },
  ],
  cta: { title: 'در منطقهٔ خود نماینده شوید', text: 'فرم نمایندگی فقط چند فیلد دارد و ثبت آن چند لحظه طول می‌کشد.', label: 'درخواست نمایندگی' },
}

export const representationPage = {
  header: {
    eyebrow: 'جذب نمایندگی',
    title: 'نمایندهٔ نیکو اعتماد در منطقهٔ خود باشید',
    intro: 'اگر توان فروش و توزیع محصولات غذایی را در شهر یا استان خود دارید، درخواست خود را ثبت کنید.',
  },
  requirements: [
    { title: 'توان فروش و توزیع', text: 'دسترسی به بازار محلی و شبکهٔ فروش در منطقه.' },
    { title: 'زیرساخت توزیع', text: 'امکان نگهداری و حمل مناسب محصول در منطقهٔ فعالیت.' },
    { title: 'نگاه بلندمدت', text: 'تمایل به همکاری پایدار و توسعهٔ بازار منطقه.' },
  ],
  process: [
    { title: 'ثبت درخواست', text: 'فرم کوتاه را پر کنید.' },
    { title: 'بررسی', text: 'کارشناسان اطلاعات شما را بررسی می‌کنند.' },
    { title: 'تماس', text: 'در صورت نیاز با شما تماس می‌گیرند.' },
  ],
  form: {
    title: 'درخواست نمایندگی',
    intro: 'فرم عمداً کوتاه است؛ فقط نام، شماره موبایل و استان.',
    submitLabel: 'ثبت درخواست',
    successTitle: 'درخواست شما ثبت شد',
    successMessage:
      'درخواست شما با موفقیت ثبت شد. اطلاعات شما بررسی شده و در صورت نیاز، کارشناسان نیکو اعتماد با شما تماس خواهند گرفت.',
    privacyNote: 'اطلاعات شما فقط برای بررسی درخواست نمایندگی استفاده می‌شود.',
  },
}

export const partnershipPage = {
  header: {
    eyebrow: 'همکاری با ما',
    title: 'همکاری تجاری با نیکو اعتماد',
    intro: 'عمده‌فروشان، شرکت‌ها و کسب‌وکارهای غذایی می‌توانند برای تأمین محصولات با ما در ارتباط باشند.',
  },
  audiences: [
    { title: 'عمده‌فروشان مواد غذایی', text: 'تأمین پایدار کره و چربی‌های خوراکی.' },
    { title: 'فروشگاه‌های زنجیره‌ای', text: 'همکاری برای عرضه در شبکهٔ فروشگاهی.' },
    { title: 'هتل‌ها و رستوران‌ها', text: 'بسته‌بندی‌های مناسب مصرف حرفه‌ای.' },
    { title: 'کترینگ‌ها و مراکز تهیهٔ غذا', text: 'بسته‌های تک‌نفره و فله‌ای.' },
  ],
  benefits: [
    { title: 'تنوع بسته‌بندی', text: 'از بستهٔ تک‌نفرهٔ فرم‌سیل تا بستهٔ فله‌ای.' },
    { title: 'برندهای مجموعه', text: 'آلانیک و پاک‌خواه، متعلق به نیکو اعتماد.' },
    { title: 'ارتباط مستقیم', text: 'گفت‌وگوی مستقیم با تیم نیکو اعتماد.' },
  ],
  businessTypes: [
    { label: 'عمده‌فروشی' },
    { label: 'فروشگاه زنجیره‌ای' },
    { label: 'هتل' },
    { label: 'رستوران' },
    { label: 'کترینگ / مرکز تهیهٔ غذا' },
    { label: 'سایر' },
  ],
  form: {
    title: 'درخواست همکاری',
    intro: 'اطلاعات خود را بنویسید تا همکاران ما با شما در ارتباط باشند.',
    submitLabel: 'ارسال درخواست همکاری',
    successTitle: 'درخواست همکاری ثبت شد',
    successMessage: 'درخواست شما دریافت شد. در صورت نیاز، کارشناسان نیکو اعتماد با شما تماس خواهند گرفت.',
    privacyNote: 'اطلاعات شما فقط برای بررسی درخواست همکاری استفاده می‌شود.',
  },
}

export const contactPage = {
  header: {
    eyebrow: 'تماس با ما',
    title: 'با نیکو اعتماد در ارتباط باشید',
    intro: 'پیام خود را بنویسید یا از راه‌های ارتباطی زیر با ما تماس بگیرید.',
  },
  form: {
    title: 'ارسال پیام',
    intro: 'پیام شما مستقیم به تیم نیکو اعتماد می‌رسد.',
    submitLabel: 'ارسال پیام',
    successTitle: 'پیام شما دریافت شد',
    successMessage: 'پیام شما دریافت شد. در اولین فرصت با شما تماس می‌گیریم.',
    privacyNote: 'اطلاعات شما فقط برای پاسخ به همین پیام استفاده می‌شود.',
  },
}

export const listingPages = {
  products: {
    header: { eyebrow: 'محصولات', title: 'محصولات نیکو اعتماد', intro: 'کره و چربی‌های خوراکی در بسته‌بندی‌های تک‌نفره و فله‌ای.' },
  },
  brands: { header: { eyebrow: 'برندها', title: 'برندهای نیکو اعتماد', intro: 'هر برند هویت و محصولات مخصوص به خود را دارد.' } },
  articles: { header: { eyebrow: 'مقالات و اخبار', title: 'تازه‌ها از نیکو اعتماد', intro: 'اخبار و یادداشت‌هایی از دنیای محصولات غذایی و شبکهٔ توزیع.' } },
  productCta: {
    title: 'برای همکاری و تأمین، با ما در تماس باشید',
    text: 'شرایط تأمین و همکاری به‌صورت اختصاصی اعلام می‌شود.',
    primary: { label: 'تماس با نیکو اعتماد', href: '/contact' },
    secondary: { label: 'همکاری با ما', href: '/partnership' },
  },
}

export const categories = [
  { name: 'تک‌نفره', slug: 'single-serve', order: 10, picture: { file: 'butter-pats.webp', alt: 'چند برش کرهٔ تک‌نفره بدون بسته‌بندی' }, description: 'بسته‌های تک‌نفرهٔ فرم‌سیل برای رستوران‌ها، کترینگ‌ها، هتل‌ها و مراکز تهیهٔ غذا.' },
  { name: 'فله‌ای', slug: 'bulk', order: 20, picture: { file: 'butter-block.webp', alt: 'قالب بزرگ کره بدون بسته‌بندی' }, description: 'بسته‌بندی‌های فله‌ای برای مراکز تهیهٔ غذا، کسب‌وکارهای غذایی و پخش‌کنندگان.' },
]

export const fatTypes = [
  { name: 'گیاهی', slug: 'plant', order: 10 },
  { name: 'حیوانی', slug: 'animal', order: 20 },
  { name: 'مخلوط', slug: 'blend', order: 30 },
]

export const markets = [
  { name: 'رستوران‌ها', slug: 'restaurants', order: 10 },
  { name: 'کترینگ‌ها', slug: 'catering', order: 20 },
  { name: 'هتل‌ها', slug: 'hotels', order: 30 },
  { name: 'مراکز تهیهٔ غذا', slug: 'food-centers', order: 40 },
  { name: 'کسب‌وکارهای غذایی', slug: 'food-businesses', order: 50 },
  { name: 'فروشگاه‌های زنجیره‌ای', slug: 'chain-stores', order: 60 },
  { name: 'عمده‌فروشان', slug: 'wholesalers', order: 70 },
]

export const brands = [
  {
    name: 'آلانیک',
    slug: 'alanik',
    order: 10,
    tagline: 'برندی از مجموعهٔ نیکو اعتماد',
    description: 'آلانیک یکی از برندهای متعلق به نیکو اعتماد است. توضیح کامل برند به‌زودی در این بخش قرار می‌گیرد.',
  },
  {
    name: 'پاک‌خواه',
    slug: 'pak-khah',
    order: 20,
    tagline: 'برندی از مجموعهٔ نیکو اعتماد',
    description: 'پاک‌خواه یکی از برندهای متعلق به نیکو اعتماد است. توضیح کامل برند به‌زودی در این بخش قرار می‌گیرد.',
  },
]

const placeholderText = 'اطلاعات کامل این محصول به‌زودی در این بخش قرار می‌گیرد.'
const riceUses = [
  { title: 'پلو و چلو', description: 'ذوب‌شده روی برنج داغ' },
  { title: 'کباب', description: 'همراه کباب و گوشت کبابی' },
  { title: 'جوجه', description: 'برای جوجه‌کباب' },
]

/** Sample products: brand and packaging assignment is a placeholder until the real catalogue is entered. */
export const products = [
  {
    name: 'کره تک‌نفره فرم‌سیل',
    slug: 'single-serve-form-seal',
    order: 10,
    brand: 'alanik',
    category: 'single-serve',
    fatType: undefined as string | undefined,
    shortDescription: 'بستهٔ تک‌نفرهٔ فرم‌سیل، مناسب سرو در رستوران‌ها، کترینگ‌ها و هتل‌ها.',
    variants: [{ label: 'تک‌نفره فرم‌سیل', packaging: 'فرم‌سیل' }],
    markets: ['restaurants', 'catering', 'hotels', 'food-centers'],
    featured: true,
  },
  {
    name: 'کره فله‌ای گیاهی',
    slug: 'bulk-plant',
    order: 20,
    brand: 'pak-khah',
    category: 'bulk',
    fatType: 'plant',
    shortDescription: placeholderText,
    variants: [{ label: 'فله‌ای' }],
    markets: ['food-centers', 'food-businesses', 'wholesalers'],
    featured: true,
  },
  {
    name: 'کره فله‌ای حیوانی',
    slug: 'bulk-animal',
    order: 30,
    brand: 'alanik',
    category: 'bulk',
    fatType: 'animal',
    shortDescription: placeholderText,
    variants: [{ label: 'فله‌ای' }],
    markets: ['food-centers', 'food-businesses', 'wholesalers'],
    featured: true,
  },
  {
    name: 'کره فله‌ای مخلوط',
    slug: 'bulk-blend',
    order: 40,
    brand: 'pak-khah',
    category: 'bulk',
    fatType: 'blend',
    shortDescription: placeholderText,
    variants: [{ label: 'فله‌ای' }],
    markets: ['food-centers', 'food-businesses', 'wholesalers'],
    featured: true,
  },
].map((p) => ({ ...p, applications: riceUses, features: [] as { text: string }[], specs: [] as { label: string; value: string }[] }))
