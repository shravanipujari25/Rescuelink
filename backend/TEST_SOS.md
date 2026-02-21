
You can test the SOS feature using the following `curl` commands.

> **Note:** Replace `YOUR_TOKEN_HERE` with a valid JWT token from a logged-in user.

### 1. Create an SOS Request (Citizen Role)
Use a token from a user with the `citizen` role.

```bash
curl -X POST http://localhost:5000/api/sos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "emergency_type": "medical",
    "severity": "high",
    "description": "Severe chest pain, need ambulance immediately.",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "address": "123 Main St, Mumbai",
    "people_count": 1,
    "contact_phone": "+919876543210"
  }'
```

### 2. Update Live Location (Citizen Role)
Use the `sos_id` returned from the previous step.

```bash
curl -X POST http://localhost:5000/api/sos/live-location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "sos_id": "REPLACE_WITH_SOS_ID",
    "latitude": 19.0765,
    "longitude": 72.8780
  }'
```

### 3. Get Assigned SOS Requests (Volunteer/NGO/Admin Role)
Use a token from a user with `volunteer`, `ngo`, or `admin` role who has been assigned an SOS.
*(Note: Currently, assignment logic happens via database or admin panel manually, so you might see an empty list unless you manually assign an SOS to this user in the database).*

```bash
curl -X GET http://localhost:5000/api/sos/assigned \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Resolve an SOS Request (Responders)
Mark an SOS as resolved.

```bash
curl -X PUT http://localhost:5000/api/sos/REPLACE_WITH_SOS_ID/resolve \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
