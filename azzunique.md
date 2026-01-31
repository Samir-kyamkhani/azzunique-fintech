1️⃣ platform_services
👉 “System kya-kya service deta hai?”
platform_services

🔹 Example rows
code	name
RECHARGE	Mobile Recharge
DMT	Money Transfer
BBPS	Bill Payment
🔹 Kaun banata hai?

✅ AZZUNIQUE (Super Admin)
(seeding time ya admin panel se)

🔹 Kaun use karta hai?

tenant_services

service_providers

Runtime service resolution (RechargeRuntimeService)

🔹 Kyu zaroori hai?

Ye master list hai
Bina iske tenant ya provider kuch enable hi nahi kar sakte

2️⃣ platform_service_features
👉 “Ek service ke andar kya-kya options/features hain?”
platform_service_features

🔹 Example

Recharge service ke features:

service	feature
RECHARGE	PREPAID
RECHARGE	POSTPAID
RECHARGE	DTH

DMT ke:

service	feature
DMT	IMPS
DMT	NEFT
🔹 Kaun banata hai?

✅ AZZUNIQUE

🔹 Kaun use karta hai?

Commission rules

Provider capability mapping

Feature-wise enable/disable

🔹 Kyu alag table?

Kyuki commission, provider support, pricing
feature ke hisaab se alag hota hai


3️⃣ service_providers
👉 “Kaunsa vendor kaunsi service deta hai?”
service_providers

🔹 Example
platformService	provider
RECHARGE	MPLAN
RECHARGE	RECHARGE_EXCHANGE
DMT	PAYTM
DMT	ICICI
🔹 handler ka matlab?
plugins/recharge/mplan.plugin.js


Ye batata hai code mein kaunsa plugin use hoga

🔹 Kaun banata hai?

✅ AZZUNIQUE

🔹 Kyu zaroori?

Same service ke multiple vendors ho sakte hain
(fallback, pricing, downtime handling)


4️⃣ service_provider_features
👉 “Kaunsa provider kaunsa feature support karta hai?”
service_provider_features

🔹 Example
provider	feature
MPLAN	PREPAID
MPLAN	DTH
RECHARGE_EXCHANGE	PREPAID
🔹 Kaun banata hai?

✅ AZZUNIQUE

🔹 Runtime mein kya kaam?

Validate: “ye provider ye feature kar sakta hai ya nahi”

Future fallback logic

🔹 Kyu zaroori?

Sab providers sab feature nahi dete
Ye table truth source hai


5️⃣ tenant_services
👉 “Kaunsa tenant kaunsi service use kar sakta hai?”
tenant_services

🔹 Example
tenant	service	enabled
WL1	RECHARGE	✅
WL1	DMT	❌
🔹 Kaun banata hai?

✅ Tenant Owner
(AZZUNIQUE → Reseller → WhiteLabel)

🔹 Runtime use
RechargeRuntimeService.resolve()


Agar chain mein kahin bhi isEnabled=false → service block

🔹 Kyu?

Hierarchy control
Parent disable kare to child bhi disable


6️⃣ tenant_service_providers
👉 “Tenant kis provider ke saath kaam karega?”
tenant_service_providers

🔹 Example
tenant	service	provider	config
WL1	RECHARGE	MPLAN	apiKey
RESELLER	RECHARGE	RECHARGE_EXCHANGE	token
🔹 config kya hai?

Provider-specific secrets:

{
  "apiKey": "xxxx",
  "token": "yyyy"
}

🔹 Kaun banata hai?

✅ Tenant Owner / Parent Tenant

🔹 Runtime mein kya hota hai?
getRechargePlugin(providerId, config)


Top-most tenant ka provider win karta hai

🔹 Kyu?

Multi-tenant SaaS flexibility
Har tenant apna vendor choose kar sake


🔁 RUNTIME FLOW (Recharge example)
User recharge karta hai
↓
RechargeRuntimeService.resolve()
↓
tenant_services → enabled check (chain)
↓
tenant_service_providers → provider pick
↓
service_providers → plugin handler
↓
plugin.recharge()

🧑‍💼 KAUN KYA BANATA HAI (CLEAR TABLE)
Role	Tables
AZZUNIQUE	platform_services, features, providers
AZZUNIQUE	provider_features
Tenant Owner	tenant_services
Tenant Owner	tenant_service_providers
Runtime	sirf READ
🏁 FINAL SUMMARY (YAAD RAKHO)

platform_ = system definition*

service_provider_ = vendor capability*

tenant_ = business decision*

runtime kabhi insert/update nahi karta

Tumne bahut clean, scalable SaaS design banaya hai —
ye structure Railway / Stripe-level systems mein use hota hai.