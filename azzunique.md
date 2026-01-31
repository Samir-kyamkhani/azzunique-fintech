
---

## 1️⃣ platform_services

### 👉 Purpose  
**System kya-kya services provide karta hai**

### 📦 Table
`platform_services`

### 🔹 Columns (suggested)

| column | type | description |
|------|------|-------------|
| id | uuid | primary key |
| code | string | unique service code |
| name | string | human readable name |
| isActive | boolean | system level toggle |

### 🔹 Example Data

| code | name |
|-----|-----|
| RECHARGE | Mobile Recharge |
| DMT | Money Transfer |
| BBPS | Bill Payment |

### 👤 Managed By
✅ **AZZUNIQUE (Super Admin)**

### ❓ Why needed?
- Master service list
- No tenant / provider can work without this

---

## 2️⃣ platform_service_features

### 👉 Purpose  
**Service ke andar available features / modes**

### 📦 Table
`platform_service_features`

### 🔹 Columns

| column | type |
|------|------|
| id | uuid |
| platformServiceId | fk |
| featureCode | string |
| isActive | boolean |

### 🔹 Example

| service | feature |
|------|--------|
| RECHARGE | PREPAID |
| RECHARGE | POSTPAID |
| RECHARGE | DTH |
| DMT | IMPS |
| DMT | NEFT |

### 👤 Managed By
✅ **AZZUNIQUE**

### ❓ Why separate table?
- Commission
- Pricing
- Provider support  
👉 sab **feature-level** pe change hota hai

---

## 3️⃣ service_providers

### 👉 Purpose  
**Kaunsa vendor kaunsi service deta hai**

### 📦 Table
`service_providers`

### 🔹 Columns

| column | type |
|------|------|
| id | uuid |
| platformServiceId | fk |
| providerCode | string |
| handler | string |
| isActive | boolean |

### 🔹 Example

| service | provider | handler |
|------|----------|---------|
| RECHARGE | MPLAN | plugins/recharge/mplan.plugin.js |
| RECHARGE | RECHARGE_EXCHANGE | plugins/recharge/rex.plugin.js |
| DMT | PAYTM | plugins/dmt/paytm.plugin.js |

### 👤 Managed By
✅ **AZZUNIQUE**

### ❓ Why needed?
- Multiple vendors per service
- Fallback & failover
- Cost optimization

---

## 4️⃣ service_provider_features

### 👉 Purpose  
**Provider kis feature ko support karta hai**

### 📦 Table
`service_provider_features`

### 🔹 Columns

| column | type |
|------|------|
| id | uuid |
| serviceProviderId | fk |
| featureCode | string |
| isActive | boolean |

### 🔹 Example

| provider | feature |
|--------|---------|
| MPLAN | PREPAID |
| MPLAN | DTH |
| RECHARGE_EXCHANGE | PREPAID |

### 👤 Managed By
✅ **AZZUNIQUE**

### ❓ Why needed?
- Validation layer
- Truth source for capabilities

---

## 5️⃣ tenant_services

### 👉 Purpose  
**Tenant kaunsa service use kar sakta hai**

### 📦 Table
`tenant_services`

### 🔹 Columns

| column | type |
|------|------|
| id | uuid |
| tenantId | fk |
| platformServiceId | fk |
| isEnabled | boolean |

### 🔹 Example

| tenant | service | enabled |
|------|---------|--------|
| WL1 | RECHARGE | true |
| WL1 | DMT | false |

### 👤 Managed By
✅ **Tenant Owner / Parent Tenant**

### ❓ Why needed?
- Hierarchy control
- Parent disable → child auto disable

---

## 6️⃣ tenant_service_providers

### 👉 Purpose  
**Tenant kis vendor ke saath kaam karega**

### 📦 Table
`tenant_service_providers`

### 🔹 Columns

| column | type |
|------|------|
| id | uuid |
| tenantId | fk |
| platformServiceId | fk |
| serviceProviderId | fk |
| config | json |
| isActive | boolean |

### 🔹 Example

| tenant | service | provider |
|------|--------|---------|
| WL1 | RECHARGE | MPLAN |
| RESELLER | RECHARGE | RECHARGE_EXCHANGE |

### 🔐 Config Example

```json
{
  "apiKey": "xxxx",
  "token": "yyyy"
}
