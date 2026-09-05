import Link from "next/link";
import type { Locale } from "@/lib/i18n";

type LegalKind = "privacy" | "terms" | "returns";
type Section = { title: string; paragraphs?: string[]; bullets?: string[] };
type Policy = { title: string; intro: string; sections: Section[] };

const updated = { ar: "4 سبتمبر 2026", en: "4 September 2026" };

const policies: Record<Locale, Record<LegalKind, Policy>> = {
  ar: {
    privacy: {
      title: "سياسة الخصوصية",
      intro: "توضح هذه السياسة كيف يجمع Xvond Smart Store البيانات الشخصية ويستخدمها ويحميها عند استخدامك للموقع أو إنشاء حساب أو تنفيذ طلب.",
      sections: [
        { title: "1. البيانات التي نجمعها", bullets: ["بيانات الحساب مثل الاسم والبريد الإلكتروني ورقم الهاتف.", "بيانات الطلب والتوصيل مثل العنوان والمحافظة والمدينة وتفاصيل المنتجات المطلوبة.", "بيانات الدفع اللازمة لإتمام المعاملة. لا نخزن بيانات البطاقة الكاملة عندما تتم معالجة الدفع من خلال مزود دفع معتمد.", "بيانات تقنية محدودة مثل عنوان IP ونوع المتصفح وملفات تعريف الارتباط وسجلات الاستخدام اللازمة للأمان وتشغيل الموقع."] },
        { title: "2. لماذا نستخدم البيانات", bullets: ["إنشاء الحساب وإدارته وتنفيذ الطلبات والتوصيل وخدمة العملاء.", "إرسال رسائل مرتبطة بالطلب أو الحساب أو الأمان.", "منع الاحتيال وإساءة الاستخدام وحماية المتجر والعملاء.", "تحسين تجربة المتجر وقياس الأداء عند السماح بذلك.", "الامتثال للالتزامات القانونية والتنظيمية في سلطنة عُمان."] },
        { title: "3. الموافقة والأساس القانوني", paragraphs: ["نعالج البيانات عند الحاجة لتنفيذ طلبك أو تقديم الخدمة، وعند وجود التزام قانوني، أو بناءً على موافقتك عندما تكون الموافقة مطلوبة. يمكنك سحب الموافقة على المعالجات القائمة عليها، دون أن يؤثر ذلك على المعالجة التي تمت بصورة مشروعة قبل السحب."] },
        { title: "4. مشاركة البيانات", paragraphs: ["قد نشارك الحد الأدنى اللازم من البيانات مع مزودي الدفع، والتوصيل، والبنية التحتية التقنية، والبريد الإلكتروني، والجهات المهنية أو الرسمية عند الحاجة. نلزم مزودي الخدمة باستخدام البيانات للغرض المحدد وبما يتوافق مع المتطلبات القانونية المناسبة."] },
        { title: "5. موقع قاعدة البيانات ونقل البيانات", paragraphs: ["تُستضاف قاعدة البيانات الأساسية لـ Xvond Smart Store، التي تُحفظ فيها بيانات الحسابات والطلبات والتوصيل، داخل سلطنة عُمان. وقد تتطلب بعض الخدمات المساندة، مثل معالجة الدفع أو البريد الإلكتروني أو خدمات تقنية محددة، معالجة الحد الأدنى اللازم من البيانات بواسطة مزودين خارج السلطنة. وفي هذه الحالات يتم التعامل مع أي نقل أو معالجة خارجية وفق المتطلبات النظامية المطبقة واتخاذ الضمانات المناسبة لحماية البيانات."] },
        { title: "6. الاحتفاظ بالبيانات", paragraphs: ["نحتفظ بالبيانات فقط للمدة اللازمة لتنفيذ الأغراض الموضحة في هذه السياسة، والوفاء بالالتزامات المحاسبية والقانونية، وتسوية النزاعات، وحماية الحقوق. ثم نحذفها أو نجعلها غير قابلة للتعرف على صاحبها عندما لا تعود هناك حاجة مشروعة للاحتفاظ بها."] },
        { title: "7. حقوقك", bullets: ["طلب معرفة البيانات الشخصية المتعلقة بك وفق ما يسمح به القانون.", "طلب تصحيح أو تحديث البيانات غير الدقيقة.", "طلب محو البيانات عندما تنطبق الشروط القانونية لذلك.", "سحب الموافقة عندما تكون المعالجة مبنية عليها.", "الاعتراض أو طلب تقييد بعض أوجه المعالجة متى كان ذلك متاحًا قانونيًا."] },
        { title: "8. ملفات تعريف الارتباط", paragraphs: ["قد يستخدم الموقع ملفات تعريف ارتباط ضرورية لتسجيل الدخول، وحفظ السلة، والأمان، وتشغيل الوظائف الأساسية. أي ملفات غير ضرورية لأغراض تحليلية أو تسويقية تخضع للإعدادات أو الموافقة المناسبة عند تطبيقها."] },
        { title: "9. حماية البيانات", paragraphs: ["نستخدم تدابير تقنية وتنظيمية معقولة، منها الاتصالات المشفرة، وضوابط الوصول، وحماية الجلسات، وتقليل البيانات، للحد من الوصول غير المصرح به أو الفقد أو التغيير أو الإفصاح غير المشروع."] },
        { title: "10. الأطفال", paragraphs: ["المتجر غير موجه لإنشاء حسابات مستقلة لمن هم دون السن القانوني للتعاقد. يجب أن تتم المشتريات الخاصة بالقاصرين بواسطة ولي أو ممثل قانوني مؤهل."] },
        { title: "11. التحديثات والتواصل", paragraphs: ["قد نحدّث هذه السياسة عند تغير خدماتنا أو المتطلبات القانونية. يظهر تاريخ آخر تحديث أعلى الصفحة. للاستفسارات أو ممارسة حقوق الخصوصية، استخدم قنوات التواصل الرسمية المنشورة في Xvond Smart Store أو بيانات التواصل الواردة في تأكيد الطلب أو الفاتورة."] }
      ]
    },
    terms: {
      title: "شروط الاستخدام",
      intro: "تحكم هذه الشروط استخدام Xvond Smart Store وعمليات الشراء التي تتم من خلاله. باستخدام المتجر أو تقديم طلب، فإنك توافق على هذه الشروط والسياسات المرتبطة بها.",
      sections: [
        { title: "1. المتجر والجهة المشغلة", paragraphs: ["Xvond Smart Store هو الاسم التجاري المستخدم لواجهة المتجر الإلكترونية. تكون بيانات الجهة المشغلة القانونية وبيانات الفاتورة أو السجل، عند انطباقها، هي البيانات المعتمدة في المعاملة."] },
        { title: "2. الأهلية والحساب", paragraphs: ["يجب أن تكون مؤهلاً قانونًا لإجراء عملية الشراء أو أن تستخدم المتجر تحت إشراف ولي أو ممثل قانوني. أنت مسؤول عن صحة بيانات حسابك والمحافظة على سرية بيانات الدخول وإبلاغنا عند الاشتباه بأي استخدام غير مصرح به."] },
        { title: "3. معلومات المنتجات والأسعار", paragraphs: ["نسعى لعرض أوصاف وأسعار وصور ومخزون المنتجات بدقة. جميع الأسعار في مرحلة الإطلاق الحالية معروضة ومحصلة بالريال العُماني (OMR). قد تختلف الألوان أو المظهر قليلًا بحسب الشاشة. إذا ظهر خطأ جوهري في السعر أو الوصف قبل تنفيذ الطلب، يحق لنا تعليق الطلب والتواصل معك للتصحيح أو الإلغاء وإعادة أي مبلغ تم تحصيله بحسب الحالة."] },
        { title: "4. الطلب وقبوله", paragraphs: ["إرسال الطلب لا يعني قبوله النهائي. يتم قبول الطلب بعد التحقق من التوفر وصحة البيانات والدفع عند الحاجة. قد نرفض أو نلغي طلبًا لأسباب مشروعة مثل عدم توفر المنتج، الاشتباه بالاحتيال، تعذر الدفع، أو وجود خطأ مادي واضح."] },
        { title: "5. الدفع", paragraphs: ["يمكن الدفع عند الاستلام عندما يكون هذا الخيار متاحًا، كما تتم المدفوعات الإلكترونية من خلال مزود الدفع المتاح في المتجر. قد يخضع الدفع الإلكتروني لشروط مزود الخدمة وإجراءات التحقق الخاصة به. لا يعتبر الطلب مدفوعًا إلكترونيًا إلا بعد تأكيد حالة الدفع من النظام المعتمد."] },
        { title: "6. التوصيل", paragraphs: ["في مرحلة الإطلاق الحالية، يقبل Xvond Smart Store طلبات التوصيل داخل سلطنة عُمان فقط ولا يقبل عناوين توصيل خارج السلطنة. التوصيل مجاني للمناطق العُمانية المفعّلة في المتجر. تظهر المدة التقديرية بحسب المنطقة قبل إتمام الطلب عندما تكون الخدمة متاحة، وقد تتأثر بعوامل خارجة عن السيطرة المعقولة. مسؤوليتك تزويدنا بعنوان داخل سلطنة عُمان ورقم اتصال صحيحين وتمكين التسليم."] },
        { title: "7. الاسترجاع والتبديل", paragraphs: ["تطبق سياسة الاسترجاع والتبديل المنشورة في المتجر كجزء من هذه الشروط، مع عدم الإخلال بأي حقوق إلزامية للمستهلك بموجب قوانين سلطنة عُمان."] },
        { title: "8. الاستخدام المقبول", bullets: ["عدم استخدام المتجر في نشاط غير قانوني أو احتيالي.", "عدم محاولة اختراق المتجر أو تعطيله أو الوصول غير المصرح به إلى الأنظمة أو الحسابات.", "عدم نسخ أو استغلال محتوى المتجر أو علاماته بطريقة تنتهك حقوق الملكية الفكرية.", "عدم تقديم معلومات مضللة أو استخدام وسائل دفع لا تملك حق استخدامها."] },
        { title: "9. الملكية الفكرية", paragraphs: ["العلامة التجارية Xvond Smart Store وتصميم الموقع والنصوص والرسومات والبرمجيات والمحتوى المملوك لنا أو المرخص لنا محمية وفق القوانين المطبقة. لا يمنحك استخدام المتجر أي حق ملكية فيها."] },
        { title: "10. المسؤولية", paragraphs: ["لا نستبعد أو نحد من أي مسؤولية لا يجوز استبعادها قانونًا، بما في ذلك حقوق المستهلك الإلزامية. وفي الحدود التي يسمح بها القانون، لا نتحمل الخسائر غير المباشرة أو الناتجة عن إساءة استخدام الموقع أو أحداث خارجة عن السيطرة المعقولة."] },
        { title: "11. القانون الواجب التطبيق", paragraphs: ["تخضع هذه الشروط لقوانين سلطنة عُمان. نسعى أولًا إلى حل أي نزاع بصورة ودية، دون المساس بحقوق المستهلك في اللجوء إلى هيئة حماية المستهلك أو الجهات والمحاكم المختصة."] },
        { title: "12. تعديل الشروط", paragraphs: ["قد نحدّث هذه الشروط لأسباب تشغيلية أو قانونية. تسري النسخة المنشورة على الاستخدام والطلبات اللاحقة لتاريخ نفاذها، ما لم يقتض القانون خلاف ذلك."] }
      ]
    },
    returns: {
      title: "سياسة الاسترجاع والتبديل",
      intro: "تهدف هذه السياسة إلى توضيح طريقة طلب الاسترجاع أو التبديل في Xvond Smart Store، مع الحفاظ كاملًا على الحقوق التي يقررها قانون حماية المستهلك في سلطنة عُمان.",
      sections: [
        { title: "1. السلع المعيبة أو غير المطابقة", paragraphs: ["إذا كان المنتج معيبًا، أو غير مطابق للمواصفات، أو لا يحقق الغرض الذي بيع من أجله، يمكنك طلب الاستبدال أو الإرجاع واسترداد القيمة خلال 15 يومًا من استلام/شراء السلعة وفق الحقوق النظامية المطبقة، بشرط تقديم ما يثبت الشراء وألا يكون العيب ناتجًا عن سوء الاستخدام."] },
        { title: "2. الاسترجاع أو التبديل للمنتجات غير المعيبة", paragraphs: ["يمكن طلب إرجاع أو تبديل المنتجات المؤهلة خلال 15 يومًا من الاستلام إذا كانت غير مستخدمة، وفي حالتها الأصلية، ومع ملحقاتها وتغليفها وبطاقاتها متى كان ذلك مناسبًا. يخضع قبول الطلب للفحص ولطبيعة المنتج، دون الإخلال بأي حق إلزامي للمستهلك."] },
        { title: "3. المنتجات غير المؤهلة لأسباب صحية أو لطبيعتها", paragraphs: ["ما لم تكن معيبة أو غير مطابقة، قد لا تقبل إعادة المنتجات القابلة للتلف سريعًا، أو المنتجات الشخصية/الصحية أو مستحضرات التجميل بعد فتح الختم أو الاستخدام، أو المنتجات المصنوعة أو المخصصة حسب الطلب، أو أي فئة يمنع القانون أو طبيعتها إعادة بيعها بعد الفتح."] },
        { title: "4. طريقة تقديم الطلب", bullets: ["قدّم طلب الاسترجاع من حسابك إن كان الخيار متاحًا، أو تواصل معنا عبر قناة الدعم الرسمية المنشورة في المتجر.", "اذكر رقم الطلب والمنتج والسبب، وأرفق صورًا واضحة عند وجود عيب أو تلف أو خطأ في المنتج.", "انتظر تعليمات إعادة المنتج قبل إرساله حتى يمكن تتبع العملية بشكل صحيح."] },
        { title: "5. تكاليف الإرجاع", paragraphs: ["إذا كان سبب الإرجاع عيبًا في المنتج أو خطأ من Xvond Smart Store، يتحمل المتجر تكاليف الإرجاع المعقولة وفق الآلية التي يحددها الدعم. أما الإرجاع الاختياري لمنتج سليم، فقد يتحمل العميل تكلفة الشحن الفعلية إذا كانت مستحقة وتم توضيحها له قبل تنفيذ الإرجاع."] },
        { title: "6. الاسترداد المالي", paragraphs: ["بعد استلام المنتج وفحصه واعتماد الاسترجاع، تتم إعادة المبلغ المستحق إلى وسيلة الدفع الأصلية متى كان ذلك ممكنًا، أو بطريقة نظامية بديلة يتم الاتفاق عليها. قد يستغرق ظهور المبلغ مدة إضافية تعتمد على البنك أو مزود الدفع. لا تخصم رسوم بسبب عيب مشمول بحقوق المستهلك."] },
        { title: "7. الطلبات التالفة أو الخاطئة عند التسليم", paragraphs: ["إذا استلمت منتجًا مختلفًا عن طلبك أو وصل متضررًا، أبلغنا بأقرب وقت ممكن مع رقم الطلب وصور الحالة. سنرتب الحل المناسب من استبدال أو استرجاع أو استرداد قيمة بحسب الحالة وحقوقك القانونية."] },
        { title: "8. الإلغاء قبل الشحن", paragraphs: ["يمكن طلب إلغاء الطلب قبل دخوله مرحلة الشحن. إذا كان قد تم تحصيل المبلغ وقُبل الإلغاء، يبدأ رد المبلغ عبر وسيلة الدفع المستخدمة. إذا تم شحن الطلب بالفعل، تطبق إجراءات الاسترجاع المناسبة."] },
        { title: "9. حقوقك القانونية", paragraphs: ["هذه السياسة لا تنتقص من أي حق إلزامي لك بموجب قانون حماية المستهلك أو لوائحه في سلطنة عُمان. عند التعارض، تسري الأحكام النظامية الإلزامية."] }
      ]
    }
  },
  en: {
    privacy: {
      title: "Privacy Policy",
      intro: "This policy explains how Xvond Smart Store collects, uses, and protects personal data when you browse the store, create an account, or place an order.",
      sections: [
        { title: "1. Data we collect", bullets: ["Account details such as name, email address, and phone number.", "Order and delivery details such as address, governorate, city, and purchased items.", "Payment information needed to complete a transaction. We do not store full card details when payment is processed by an approved payment provider.", "Limited technical data such as IP address, browser type, cookies, and security or usage logs needed to operate and protect the service."] },
        { title: "2. How we use data", bullets: ["To create and manage accounts, fulfil orders, arrange delivery, and provide support.", "To send transactional, account, and security communications.", "To prevent fraud, abuse, and unauthorized activity.", "To improve store performance and user experience where permitted.", "To comply with applicable legal and regulatory obligations in Oman."] },
        { title: "3. Consent and lawful processing", paragraphs: ["We process data as needed to perform your order or provide the service, comply with legal obligations, or based on your consent where consent is required. You may withdraw consent for processing that relies on consent, without affecting lawful processing carried out before withdrawal."] },
        { title: "4. Sharing data", paragraphs: ["We may share the minimum necessary data with payment, delivery, infrastructure, email, professional, or official service providers where needed. Service providers are expected to use personal data only for the relevant purpose and under appropriate safeguards."] },
        { title: "5. Database location and international processing", paragraphs: ["The primary Xvond Smart Store database used to store account, order, and delivery data is hosted inside the Sultanate of Oman. Some supporting services, such as payment processing, email, or specific technical services, may require the minimum necessary data to be processed by providers outside Oman. Any such transfer or external processing is handled in accordance with applicable legal requirements and appropriate safeguards."] },
        { title: "6. Retention", paragraphs: ["We keep personal data only for as long as reasonably necessary for the purposes described here, legal or accounting obligations, dispute resolution, and protection of rights. Data is then deleted or de-identified when no legitimate retention need remains."] },
        { title: "7. Your rights", bullets: ["Request access to personal data about you where available by law.", "Request correction or updating of inaccurate data.", "Request deletion where the legal conditions are met.", "Withdraw consent where processing relies on consent.", "Object to or request restriction of certain processing where legally available."] },
        { title: "8. Cookies", paragraphs: ["The store may use cookies required for sign-in, cart persistence, security, and essential functionality. Non-essential analytics or marketing cookies are subject to appropriate settings or consent where applicable."] },
        { title: "9. Security", paragraphs: ["We use reasonable technical and organizational measures, including encrypted connections, access controls, session protection, and data minimization, to reduce unauthorized access, loss, alteration, or disclosure."] },
        { title: "10. Minors", paragraphs: ["The store is not intended for independent contracting by persons below the legal contracting age. Purchases for minors should be made by a qualified parent, guardian, or legal representative."] },
        { title: "11. Updates and contact", paragraphs: ["We may update this policy as our services or legal requirements change. The latest update date appears above. For privacy questions or rights requests, use the official contact channels published on Xvond Smart Store or in your order confirmation or invoice."] }
      ]
    },
    terms: {
      title: "Terms of Use",
      intro: "These terms govern access to Xvond Smart Store and purchases made through it. By using the store or placing an order, you agree to these terms and the policies incorporated into them.",
      sections: [
        { title: "1. Store and operator", paragraphs: ["Xvond Smart Store is the trading name used for the online storefront. The legal operator and invoice or registration details shown for the applicable transaction are the authoritative business details."] },
        { title: "2. Eligibility and accounts", paragraphs: ["You must be legally able to enter into the purchase or use the store under the supervision of a qualified guardian or legal representative. You are responsible for accurate account information and for protecting your login credentials."] },
        { title: "3. Products and pricing", paragraphs: ["We aim to display product descriptions, prices, images, and stock accurately. During the current launch phase, all prices are displayed and charged in Omani Rial (OMR). Appearance may vary slightly by screen. If a material pricing or description error is identified before fulfilment, we may pause the order and contact you to correct or cancel it and refund any collected amount where applicable."] },
        { title: "4. Orders and acceptance", paragraphs: ["Submitting an order is not final acceptance. Acceptance is subject to availability, valid information, and payment where required. We may lawfully decline or cancel an order due to unavailable stock, suspected fraud, failed payment, or a clear material error."] },
        { title: "5. Payment", paragraphs: ["Cash on delivery may be used where shown as available. Electronic payments are processed through the payment provider available in the store and may be subject to that provider's verification requirements. An order is not treated as electronically paid until the store receives an authoritative payment confirmation."] },
        { title: "6. Delivery", paragraphs: ["During the current launch phase, Xvond Smart Store accepts delivery orders within the Sultanate of Oman only and does not accept delivery addresses outside Oman. Delivery is free to Omani areas enabled in the store. The estimated delivery window is shown by area when available and may be affected by circumstances outside reasonable control. You are responsible for providing a valid Omani delivery address and reachable phone number."] },
        { title: "7. Returns and exchanges", paragraphs: ["The published Return & Exchange Policy forms part of these terms and does not limit mandatory consumer rights under the laws of Oman."] },
        { title: "8. Acceptable use", bullets: ["Do not use the store for unlawful or fraudulent activity.", "Do not attempt to compromise, disrupt, or obtain unauthorized access to the store, systems, or accounts.", "Do not copy or exploit store content or marks in violation of intellectual-property rights.", "Do not provide misleading information or use a payment method you are not authorized to use."] },
        { title: "9. Intellectual property", paragraphs: ["The Xvond Smart Store brand, site design, text, graphics, software, and content owned by or licensed to us are protected by applicable law. Use of the store does not transfer ownership rights to you."] },
        { title: "10. Liability", paragraphs: ["Nothing in these terms excludes liability or mandatory consumer rights that cannot legally be excluded. To the extent permitted by law, we are not responsible for indirect losses arising from misuse of the site or events outside reasonable control."] },
        { title: "11. Governing law", paragraphs: ["These terms are governed by the laws of the Sultanate of Oman. We aim to resolve disputes amicably first, without limiting a consumer's right to contact the Consumer Protection Authority or competent authorities and courts."] },
        { title: "12. Changes", paragraphs: ["We may update these terms for legal or operational reasons. The version published at the relevant time applies to subsequent use and orders unless applicable law requires otherwise."] }
      ]
    },
    returns: {
      title: "Return & Exchange Policy",
      intro: "This policy explains how return and exchange requests are handled by Xvond Smart Store while preserving all mandatory consumer rights under Omani law.",
      sections: [
        { title: "1. Defective or non-conforming goods", paragraphs: ["If a product is defective, does not conform to specifications, or does not serve its intended purpose, you may request replacement or return and refund within 15 days of receipt/purchase under applicable consumer rights, provided proof of purchase is available and the defect was not caused by misuse."] },
        { title: "2. Non-defective eligible items", paragraphs: ["Eligible unused products may be requested for return or exchange within 15 days of delivery when they remain in original condition with relevant accessories, packaging, seals, and tags. Acceptance is subject to inspection and product type, without limiting mandatory rights."] },
        { title: "3. Health, hygiene, and product-specific exclusions", paragraphs: ["Unless defective or non-conforming, rapidly perishable goods, opened personal/hygiene products or cosmetics, customized or made-to-order items, and categories that cannot lawfully or safely be resold after opening may not be eligible for discretionary return."] },
        { title: "4. How to request a return", bullets: ["Submit a return request from your account where the option is available, or contact the official support channel published by Xvond Smart Store.", "Provide the order number, item, reason, and clear photos where there is damage, defect, or a wrong item.", "Wait for return instructions before sending the item so the return can be tracked correctly."] },
        { title: "5. Return shipping costs", paragraphs: ["Where the return is caused by a defect or Xvond Smart Store error, the store bears reasonable return costs under the support process. For a discretionary return of a sound product, the customer may be responsible for actual return shipping where applicable and disclosed before the return is completed."] },
        { title: "6. Refunds", paragraphs: ["After receipt, inspection, and approval, the refundable amount is returned to the original payment method where possible, or another lawful method agreed with the customer. Bank or payment-provider processing may require additional time. No fee is deducted in a way that reduces mandatory rights for a qualifying defective item."] },
        { title: "7. Damaged or incorrect delivery", paragraphs: ["If you receive a damaged product or a different item from what you ordered, contact us as soon as reasonably possible with the order number and photos. We will arrange the appropriate replacement, return, or refund according to the circumstances and your legal rights."] },
        { title: "8. Cancellation before shipment", paragraphs: ["You may request cancellation before the order enters shipment. If payment was collected and cancellation is accepted, the refund process starts through the payment method used. If the order has already shipped, the applicable return process will apply."] },
        { title: "9. Statutory rights", paragraphs: ["This policy does not reduce any mandatory rights available to you under Omani consumer protection law and regulations. Mandatory legal provisions prevail in the event of conflict."] }
      ]
    }
  }
};

export function LegalPage({ locale, kind }: { locale: Locale; kind: LegalKind }) {
  const policy = policies[locale][kind];
  return (
    <main className="shell legal-page">
      <div className="legal-hero">
        <p>XVOND SMART STORE · LEGAL</p>
        <h1>{policy.title}</h1>
        <span>{locale === "ar" ? `آخر تحديث: ${updated.ar}` : `Last updated: ${updated.en}`}</span>
        <p className="legal-intro">{policy.intro}</p>
      </div>
      <div className="legal-layout">
        <article className="legal-document">
          {policy.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
            </section>
          ))}
        </article>
        <aside className="legal-nav">
          <strong>{locale === "ar" ? "السياسات" : "Policies"}</strong>
          <Link href={`/${locale}/privacy`}>{locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</Link>
          <Link href={`/${locale}/terms`}>{locale === "ar" ? "شروط الاستخدام" : "Terms of Use"}</Link>
          <Link href={`/${locale}/returns`}>{locale === "ar" ? "الاسترجاع والتبديل" : "Returns & Exchanges"}</Link>
        </aside>
      </div>
    </main>
  );
}
