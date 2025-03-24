# Block API Documentation

The Block API provides endpoints to manage school building blocks or wings. Each block represents a physical unit within a school that contains multiple classrooms.

## Model Structure

A block has the following properties:

| Field              | Type     | Description                                  |
| ------------------ | -------- | -------------------------------------------- |
| id                 | UUID     | Unique identifier                            |
| schoolId           | UUID     | School the block belongs to                  |
| name               | String   | Name of the block (e.g., "Science Block")    |
| numberOfClassrooms | Integer  | Number of classrooms in the block            |
| details            | String   | Detailed description (optional)              |
| location           | String   | Location within the school campus (optional) |
| yearBuilt          | Integer  | Year the block was constructed (optional)    |
| status             | String   | Current status of the block (optional)       |
| createdAt          | DateTime | Creation timestamp                           |
| updatedAt          | DateTime | Last update timestamp                        |

The `status` field can be one of: "active", "inactive", "maintenance", "planned", or "demolished".

## API Endpoints

| Method | Endpoint                        | Description                          | Auth Required |
| ------ | ------------------------------- | ------------------------------------ | ------------- |
| GET    | /api/v1/blocks                  | Get a list of blocks                 | Yes           |
| GET    | /api/v1/blocks/:id              | Get a specific block by ID           | Yes           |
| POST   | /api/v1/blocks                  | Create a new block                   | Yes           |
| PUT    | /api/v1/blocks/:id              | Update an existing block             | Yes           |
| DELETE | /api/v1/blocks/:id              | Delete a block                       | Yes           |
| GET    | /api/v1/blocks/school/:schoolId | Get all blocks for a specific school | Yes           |
| GET    | /api/v1/blocks/statistics       | Get statistics about blocks          | Yes           |
| POST   | /api/v1/blocks/bulk             | Create multiple blocks at once       | Yes           |
| DELETE | /api/v1/blocks/bulk             | Delete multiple blocks at once       | Yes           |

## Request and Response Examples

### Get a List of Blocks

**GET** `/api/v1/blocks`

**Query Parameters:**

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10, max: 100)
- `search` (optional): Search term to filter results
- `sortBy` (optional): Field to sort by (name, numberOfClassrooms, yearBuilt, status, createdAt)
- `sortOrder` (optional): Sort order, "asc" or "desc" (default: desc)
- `schoolId` (optional): Filter by school ID
- `status` (optional): Filter by status
- `yearBuiltMin` (optional): Filter by minimum year built
- `yearBuiltMax` (optional): Filter by maximum year built
- `minClassrooms` (optional): Filter by minimum number of classrooms
- `maxClassrooms` (optional): Filter by maximum number of classrooms

**Response:**

```json
{
  "success": true,
  "message": "Blocks retrieved successfully",
  "data": {
    "blocks": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "schoolId": "772e0600-g48d-71g6-d938-668877660222",
        "name": "Science Block",
        "numberOfClassrooms": 10,
        "details": "Contains science labs and lecture halls",
        "location": "North Campus",
        "yearBuilt": 1995,
        "status": "active",
        "createdAt": "2023-01-01T12:00:00Z",
        "updatedAt": "2023-01-01T12:00:00Z",
        "school": {
          "id": "772e0600-g48d-71g6-d938-668877660222",
          "name": "St. Mary's High School",
          "type": "High School"
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Get a Block by ID

**GET** `/api/v1/blocks/:id`

**Response:**

```json
{
  "success": true,
  "message": "Block retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "schoolId": "772e0600-g48d-71g6-d938-668877660222",
    "name": "Science Block",
    "numberOfClassrooms": 10,
    "details": "Contains science labs and lecture halls",
    "location": "North Campus",
    "yearBuilt": 1995,
    "status": "active",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z",
    "school": {
      "id": "772e0600-g48d-71g6-d938-668877660222",
      "name": "St. Mary's High School",
      "type": "High School"
    }
  }
}
```

### Create a New Block

**POST** `/api/v1/blocks`

**Request Body:**

```json
{
  "schoolId": "772e0600-g48d-71g6-d938-668877660222",
  "name": "Science Block",
  "numberOfClassrooms": 10,
  "details": "Contains science labs and lecture halls",
  "location": "North Campus",
  "yearBuilt": 1995,
  "status": "active"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Block created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "schoolId": "772e0600-g48d-71g6-d938-668877660222",
    "name": "Science Block",
    "numberOfClassrooms": 10,
    "details": "Contains science labs and lecture halls",
    "location": "North Campus",
    "yearBuilt": 1995,
    "status": "active",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z",
    "school": {
      "id": "772e0600-g48d-71g6-d938-668877660222",
      "name": "St. Mary's High School",
      "type": "High School"
    }
  }
}
```

### Update a Block

**PUT** `/api/v1/blocks/:id`

**Request Body:**

```json
{
  "name": "Updated Science Block",
  "numberOfClassrooms": 12,
  "details": "Updated details about the block",
  "status": "maintenance"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Block updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "schoolId": "772e0600-g48d-71g6-d938-668877660222",
    "name": "Updated Science Block",
    "numberOfClassrooms": 12,
    "details": "Updated details about the block",
    "location": "North Campus",
    "yearBuilt": 1995,
    "status": "maintenance",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z",
    "school": {
      "id": "772e0600-g48d-71g6-d938-668877660222",
      "name": "St. Mary's High School",
      "type": "High School"
    }
  }
}
```

### Delete a Block

**DELETE** `/api/v1/blocks/:id`

**Response:**

```json
{
  "success": true,
  "message": "Block deleted successfully",
  "data": {
    "success": true
  }
}
```

### Get Blocks by School

**GET** `/api/v1/blocks/school/:schoolId`

**Response:**

```json
{
  "success": true,
  "message": "School's blocks retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "name": "Science Block",
      "numberOfClassrooms": 10,
      "details": "Contains science labs and lecture halls",
      "location": "North Campus",
      "yearBuilt": 1995,
      "status": "active",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z",
      "school": {
        "id": "772e0600-g48d-71g6-d938-668877660222",
        "name": "St. Mary's High School",
        "type": "High School"
      }
    },
    {
      "id": "661f9500-f39c-51f5-c827-557766550111",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "name": "Main Building",
      "numberOfClassrooms": 15,
      "details": "Main administrative block with classrooms",
      "location": "Central Campus",
      "yearBuilt": 1990,
      "status": "active",
      "createdAt": "2023-01-02T14:30:00Z",
      "updatedAt": "2023-01-02T14:30:00Z",
      "school": {
        "id": "772e0600-g48d-71g6-d938-668877660222",
        "name": "St. Mary's High School",
        "type": "High School"
      }
    }
  ]
}
```

### Get Block Statistics

**GET** `/api/v1/blocks/statistics`

**Response:**

```json
{
  "success": true,
  "message": "Block statistics retrieved successfully",
  "data": {
    "totalBlocks": 45,
    "blocksPerSchool": {
      "772e0600-g48d-71g6-d938-668877660222": 5,
      "883f9600-h59e-81h7-e049-779988770333": 3
    },
    "totalClassrooms": 350,
    "averageClassroomsPerBlock": 7.8,
    "blocksByStatus": {
      "active": 35,
      "maintenance": 5,
      "planned": 5
    },
    "oldestBlock": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Main Building",
      "yearBuilt": 1970
    },
    "newestBlock": {
      "id": "661f9500-f39c-51f5-c827-557766550111",
      "name": "STEM Wing",
      "yearBuilt": 2022
    }
  }
}
```

### Create Multiple Blocks

**POST** `/api/v1/blocks/bulk`

**Request Body:**

```json
{
  "blocks": [
    {
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "name": "Science Block",
      "numberOfClassrooms": 10,
      "details": "Contains science labs",
      "location": "North Campus",
      "yearBuilt": 1995,
      "status": "active"
    },
    {
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "name": "Arts Block",
      "numberOfClassrooms": 8,
      "details": "Contains art studios and music rooms",
      "location": "South Campus",
      "yearBuilt": 1997,
      "status": "active"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Blocks created successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "name": "Science Block",
      "numberOfClassrooms": 10,
      "details": "Contains science labs",
      "location": "North Campus",
      "yearBuilt": 1995,
      "status": "active",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z",
      "school": {
        "id": "772e0600-g48d-71g6-d938-668877660222",
        "name": "St. Mary's High School",
        "type": "High School"
      }
    },
    {
      "id": "661f9500-f39c-51f5-c827-557766550111",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "name": "Arts Block",
      "numberOfClassrooms": 8,
      "details": "Contains art studios and music rooms",
      "location": "South Campus",
      "yearBuilt": 1997,
      "status": "active",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z",
      "school": {
        "id": "772e0600-g48d-71g6-d938-668877660222",
        "name": "St. Mary's High School",
        "type": "High School"
      }
    }
  ]
}
```

### Delete Multiple Blocks

**DELETE** `/api/v1/blocks/bulk`

**Request Body:**

```json
{
  "ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "661f9500-f39c-51f5-c827-557766550111"
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Blocks deleted successfully",
  "data": {
    "success": true,
    "count": 2
  }
}
```

## Error Responses

### Not Found Error

```json
{
  "success": false,
  "message": "Block with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "error": {
    "code": "RES-001",
    "details": null
  }
}
```

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VAL-002",
    "details": [
      {
        "field": "name",
        "message": "name is required"
      },
      {
        "field": "schoolId",
        "message": "schoolId must be a valid UUID"
      }
    ]
  }
}
```

### Authorization Error

```json
{
  "success": false,
  "message": "You don't have permission to access this resource",
  "error": {
    "code": "AUTH-005",
    "details": null
  }
}
```

## Integration with Other APIs

The Block API integrates with the following APIs:

1. **Schools API** - Blocks belong to schools and can be retrieved by school ID
2. **Users API** - User permissions determine who can create, update, or delete blocks
3. **RBAC API** - Role-based access controls define permissions for block management

## Usage Examples

### JavaScript/Fetch Example

```javascript
// Get all blocks for a school
async function getSchoolBlocks(schoolId, token) {
  const response = await fetch(`/api/v1/blocks/school/${schoolId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch blocks");
  }

  const data = await response.json();
  return data.data;
}

// Create a new block
async function createBlock(blockData, token) {
  const response = await fetch("/api/v1/blocks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(blockData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create block");
  }

  const data = await response.json();
  return data.data;
}
```

### Curl Example

```bash
# Get blocks by school
curl -X GET \
  "http://localhost:3000/api/v1/blocks/school/772e0600-g48d-71g6-d938-668877660222" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a new block
curl -X POST \
  "http://localhost:3000/api/v1/blocks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "772e0600-g48d-71g6-d938-668877660222",
    "name": "Science Block",
    "numberOfClassrooms": 10,
    "details": "Contains science labs and lecture halls",
    "location": "North Campus",
    "yearBuilt": 1995,
    "status": "active"
  }'
```
