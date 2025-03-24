# Classroom API Documentation

The Classroom API provides endpoints to manage classrooms within school buildings or blocks. Each classroom represents a physical space where educational activities take place.

## Model Structure

A classroom has the following properties:

| Field       | Type     | Description                                         |
| ----------- | -------- | --------------------------------------------------- |
| id          | UUID     | Unique identifier                                   |
| name        | String   | Name of the classroom (e.g., "Room 101")            |
| roomType    | String   | Type of classroom (standard, laboratory, etc.)      |
| maxStudents | Integer  | Maximum number of students the room can accommodate |
| blockId     | UUID     | Block/building the classroom belongs to             |
| schoolId    | UUID     | School the classroom belongs to                     |
| details     | String   | Detailed description (optional)                     |
| floor       | Integer  | Floor level (optional)                              |
| features    | String[] | Special features or equipment (optional)            |
| status      | String   | Current status of the classroom (optional)          |
| createdAt   | DateTime | Creation timestamp                                  |
| updatedAt   | DateTime | Last update timestamp                               |

The `roomType` field can be one of: "standard", "laboratory", "computer_lab", "library", "auditorium", "gymnasium", "art_studio", "music_room", "staff_room", or "other".

The `status` field can be one of: "active", "inactive", "maintenance", "renovation", or "closed".

## API Endpoints

| Method | Endpoint                            | Description                              | Auth Required |
| ------ | ----------------------------------- | ---------------------------------------- | ------------- |
| GET    | /api/v1/classrooms                  | Get a list of classrooms                 | Yes           |
| GET    | /api/v1/classrooms/:id              | Get a specific classroom by ID           | Yes           |
| POST   | /api/v1/classrooms                  | Create a new classroom                   | Yes           |
| PUT    | /api/v1/classrooms/:id              | Update an existing classroom             | Yes           |
| DELETE | /api/v1/classrooms/:id              | Delete a classroom                       | Yes           |
| GET    | /api/v1/classrooms/school/:schoolId | Get all classrooms for a specific school | Yes           |
| GET    | /api/v1/classrooms/block/:blockId   | Get all classrooms for a specific block  | Yes           |
| GET    | /api/v1/classrooms/statistics       | Get statistics about classrooms          | Yes           |
| POST   | /api/v1/classrooms/bulk             | Create multiple classrooms at once       | Yes           |
| DELETE | /api/v1/classrooms/bulk             | Delete multiple classrooms at once       | Yes           |

## Request and Response Examples

### Get a List of Classrooms

**GET** `/api/v1/classrooms`

**Query Parameters:**

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10, max: 100)
- `search` (optional): Search term to filter results
- `sortBy` (optional): Field to sort by (name, roomType, maxStudents, floor, status, createdAt)
- `sortOrder` (optional): Sort order, "asc" or "desc" (default: desc)
- `schoolId` (optional): Filter by school ID
- `blockId` (optional): Filter by block ID
- `roomType` (optional): Filter by room type
- `status` (optional): Filter by status
- `minCapacity` (optional): Filter by minimum capacity
- `maxCapacity` (optional): Filter by maximum capacity
- `floor` (optional): Filter by floor number
- `feature` (optional): Filter by a specific feature

**Response:**

```json
{
  "success": true,
  "message": "Classrooms retrieved successfully",
  "data": {
    "classrooms": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Room 101",
        "roomType": "standard",
        "maxStudents": 30,
        "blockId": "661f9500-f39c-51f5-c827-557766550111",
        "schoolId": "772e0600-g48d-71g6-d938-668877660222",
        "details": "Standard classroom with whiteboard and projector",
        "floor": 1,
        "features": ["projector", "smart_board", "air_conditioning"],
        "status": "active",
        "createdAt": "2023-01-01T12:00:00Z",
        "updatedAt": "2023-01-01T12:00:00Z",
        "block": {
          "id": "661f9500-f39c-51f5-c827-557766550111",
          "name": "Main Building",
          "schoolId": "772e0600-g48d-71g6-d938-668877660222"
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

### Get a Classroom by ID

**GET** `/api/v1/classrooms/:id`

**Response:**

```json
{
  "success": true,
  "message": "Classroom retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Room 101",
    "roomType": "standard",
    "maxStudents": 30,
    "blockId": "661f9500-f39c-51f5-c827-557766550111",
    "schoolId": "772e0600-g48d-71g6-d938-668877660222",
    "details": "Standard classroom with whiteboard and projector",
    "floor": 1,
    "features": ["projector", "smart_board", "air_conditioning"],
    "status": "active",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z",
    "block": {
      "id": "661f9500-f39c-51f5-c827-557766550111",
      "name": "Main Building",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222"
    }
  }
}
```

### Create a New Classroom

**POST** `/api/v1/classrooms`

**Request Body:**

```json
{
  "name": "Room 101",
  "roomType": "standard",
  "maxStudents": 30,
  "blockId": "661f9500-f39c-51f5-c827-557766550111",
  "schoolId": "772e0600-g48d-71g6-d938-668877660222",
  "details": "Standard classroom with whiteboard and projector",
  "floor": 1,
  "features": ["projector", "smart_board", "air_conditioning"],
  "status": "active"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Classroom created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Room 101",
    "roomType": "standard",
    "maxStudents": 30,
    "blockId": "661f9500-f39c-51f5-c827-557766550111",
    "schoolId": "772e0600-g48d-71g6-d938-668877660222",
    "details": "Standard classroom with whiteboard and projector",
    "floor": 1,
    "features": ["projector", "smart_board", "air_conditioning"],
    "status": "active",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z",
    "block": {
      "id": "661f9500-f39c-51f5-c827-557766550111",
      "name": "Main Building",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222"
    }
  }
}
```

### Update a Classroom

**PUT** `/api/v1/classrooms/:id`

**Request Body:**

```json
{
  "name": "Updated Room 101",
  "maxStudents": 25,
  "details": "Updated details about the classroom",
  "status": "maintenance"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Classroom updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Room 101",
    "roomType": "standard",
    "maxStudents": 25,
    "blockId": "661f9500-f39c-51f5-c827-557766550111",
    "schoolId": "772e0600-g48d-71g6-d938-668877660222",
    "details": "Updated details about the classroom",
    "floor": 1,
    "features": ["projector", "smart_board", "air_conditioning"],
    "status": "maintenance",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:30:00Z",
    "block": {
      "id": "661f9500-f39c-51f5-c827-557766550111",
      "name": "Main Building",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222"
    }
  }
}
```

### Delete a Classroom

**DELETE** `/api/v1/classrooms/:id`

**Response:**

```json
{
  "success": true,
  "message": "Classroom deleted successfully",
  "data": {
    "success": true
  }
}
```

### Get Classrooms by School

**GET** `/api/v1/classrooms/school/:schoolId`

**Response:**

```json
{
  "success": true,
  "message": "School's classrooms retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Room 101",
      "roomType": "standard",
      "maxStudents": 30,
      "blockId": "661f9500-f39c-51f5-c827-557766550111",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "details": "Standard classroom with whiteboard and projector",
      "floor": 1,
      "features": ["projector", "smart_board", "air_conditioning"],
      "status": "active",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z",
      "block": {
        "id": "661f9500-f39c-51f5-c827-557766550111",
        "name": "Main Building",
        "schoolId": "772e0600-g48d-71g6-d938-668877660222"
      }
    },
    {
      "id": "661f9500-f39c-51f5-c827-557766550222",
      "name": "Room 102",
      "roomType": "computer_lab",
      "maxStudents": 25,
      "blockId": "661f9500-f39c-51f5-c827-557766550111",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "details": "Computer lab with 25 workstations",
      "floor": 1,
      "features": ["computers", "projector", "air_conditioning"],
      "status": "active",
      "createdAt": "2023-01-02T10:00:00Z",
      "updatedAt": "2023-01-02T10:00:00Z",
      "block": {
        "id": "661f9500-f39c-51f5-c827-557766550111",
        "name": "Main Building",
        "schoolId": "772e0600-g48d-71g6-d938-668877660222"
      }
    }
  ]
}
```

### Get Classrooms by Block

**GET** `/api/v1/classrooms/block/:blockId`

**Response:**

```json
{
  "success": true,
  "message": "Block's classrooms retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Room 101",
      "roomType": "standard",
      "maxStudents": 30,
      "blockId": "661f9500-f39c-51f5-c827-557766550111",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "details": "Standard classroom with whiteboard and projector",
      "floor": 1,
      "features": ["projector", "smart_board", "air_conditioning"],
      "status": "active",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z",
      "block": {
        "id": "661f9500-f39c-51f5-c827-557766550111",
        "name": "Main Building",
        "schoolId": "772e0600-g48d-71g6-d938-668877660222"
      }
    },
    {
      "id": "661f9500-f39c-51f5-c827-557766550222",
      "name": "Room 102",
      "roomType": "computer_lab",
      "maxStudents": 25,
      "blockId": "661f9500-f39c-51f5-c827-557766550111",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "details": "Computer lab with 25 workstations",
      "floor": 1,
      "features": ["computers", "projector", "air_conditioning"],
      "status": "active",
      "createdAt": "2023-01-02T10:00:00Z",
      "updatedAt": "2023-01-02T10:00:00Z",
      "block": {
        "id": "661f9500-f39c-51f5-c827-557766550111",
        "name": "Main Building",
        "schoolId": "772e0600-g48d-71g6-d938-668877660222"
      }
    }
  ]
}
```

### Get Classroom Statistics

**GET** `/api/v1/classrooms/statistics`

**Response:**

```json
{
  "success": true,
  "message": "Classroom statistics retrieved successfully",
  "data": {
    "totalClassrooms": 120,
    "classroomsPerSchool": {
      "772e0600-g48d-71g6-d938-668877660222": 75,
      "883f9600-h59e-81h7-e049-779988770333": 45
    },
    "classroomsPerBlock": {
      "661f9500-f39c-51f5-c827-557766550111": 10,
      "772g0600-g48d-71g6-d938-668877660333": 12
    },
    "totalCapacity": 3500,
    "averageCapacity": 29.2,
    "classroomsByType": {
      "standard": 80,
      "laboratory": 15,
      "computer_lab": 10,
      "library": 5,
      "auditorium": 3,
      "gymnasium": 2,
      "art_studio": 3,
      "music_room": 2
    },
    "classroomsByStatus": {
      "active": 100,
      "maintenance": 10,
      "renovation": 5,
      "inactive": 5
    },
    "featuresDistribution": {
      "projector": 90,
      "smart_board": 45,
      "air_conditioning": 70,
      "computers": 25,
      "lab_equipment": 15,
      "musical_instruments": 2
    }
  }
}
```

### Create Multiple Classrooms

**POST** `/api/v1/classrooms/bulk`

**Request Body:**

```json
{
  "classrooms": [
    {
      "name": "Room 101",
      "roomType": "standard",
      "maxStudents": 30,
      "blockId": "661f9500-f39c-51f5-c827-557766550111",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "details": "Standard classroom with whiteboard",
      "floor": 1,
      "features": ["projector", "smart_board"],
      "status": "active"
    },
    {
      "name": "Room 102",
      "roomType": "computer_lab",
      "maxStudents": 25,
      "blockId": "661f9500-f39c-51f5-c827-557766550111",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "details": "Computer lab with 25 workstations",
      "floor": 1,
      "features": ["computers", "projector"],
      "status": "active"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Classrooms created successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Room 101",
      "roomType": "standard",
      "maxStudents": 30,
      "blockId": "661f9500-f39c-51f5-c827-557766550111",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "details": "Standard classroom with whiteboard",
      "floor": 1,
      "features": ["projector", "smart_board"],
      "status": "active",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z",
      "block": {
        "id": "661f9500-f39c-51f5-c827-557766550111",
        "name": "Main Building",
        "schoolId": "772e0600-g48d-71g6-d938-668877660222"
      }
    },
    {
      "id": "661f9500-f39c-51f5-c827-557766550222",
      "name": "Room 102",
      "roomType": "computer_lab",
      "maxStudents": 25,
      "blockId": "661f9500-f39c-51f5-c827-557766550111",
      "schoolId": "772e0600-g48d-71g6-d938-668877660222",
      "details": "Computer lab with 25 workstations",
      "floor": 1,
      "features": ["computers", "projector"],
      "status": "active",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z",
      "block": {
        "id": "661f9500-f39c-51f5-c827-557766550111",
        "name": "Main Building",
        "schoolId": "772e0600-g48d-71g6-d938-668877660222"
      }
    }
  ]
}
```

### Delete Multiple Classrooms

**DELETE** `/api/v1/classrooms/bulk`

**Request Body:**

```json
{
  "ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "661f9500-f39c-51f5-c827-557766550222"
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Classrooms deleted successfully",
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
  "message": "Classroom with ID 550e8400-e29b-41d4-a716-446655440000 not found",
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
        "field": "roomType",
        "message": "roomType must be one of: standard, laboratory, computer_lab, library, auditorium, gymnasium, art_studio, music_room, staff_room, other"
      }
    ]
  }
}
```

### Business Logic Error

```json
{
  "success": false,
  "message": "The specified block does not belong to the specified school",
  "error": {
    "code": "BUS-003",
    "details": null
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

The Classroom API integrates with the following APIs:

1. **Schools API** - Classrooms belong to schools and can be retrieved by school ID
2. **Blocks API** - Classrooms belong to blocks and can be retrieved by block ID
3. **Users API** - User permissions determine who can create, update, or delete classrooms
4. **RBAC API** - Role-based access controls define permissions for classroom management

## Usage Examples

### JavaScript/Fetch Example

```javascript
// Get all classrooms for a block
async function getBlockClassrooms(blockId, token) {
  const response = await fetch(`/api/v1/classrooms/block/${blockId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch classrooms");
  }

  const data = await response.json();
  return data.data;
}

// Create a new classroom
async function createClassroom(classroomData, token) {
  const response = await fetch("/api/v1/classrooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(classroomData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create classroom");
  }

  const data = await response.json();
  return data.data;
}
```

### Curl Example

```bash
# Get classrooms by block
curl -X GET \
  "http://localhost:3000/api/v1/classrooms/block/661f9500-f39c-51f5-c827-557766550111" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a new classroom
curl -X POST \
  "http://localhost:3000/api/v1/classrooms" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Room 101",
    "roomType": "standard",
    "maxStudents": 30,
    "blockId": "661f9500-f39c-51f5-c827-557766550111",
    "schoolId": "772e0600-g48d-71g6-d938-668877660222",
    "details": "Standard classroom with whiteboard and projector",
    "floor": 1,
    "features": ["projector", "smart_board", "air_conditioning"],
    "status": "active"
  }'
```

## Room Types

The following room types are supported:

1. **standard** - Regular classroom for general teaching
2. **laboratory** - Specialized room for science experiments
3. **computer_lab** - Room equipped with computers for IT classes
4. **library** - Room for books and quiet study
5. **auditorium** - Large room for presentations and assemblies
6. **gymnasium** - Room for physical education
7. **art_studio** - Specialized room for art classes
8. **music_room** - Room for music classes and practice
9. **staff_room** - Room for teaching staff
10. **other** - Other specialized rooms

## Classroom Statuses

The following statuses are supported:

1. **active** - Classroom is in use
2. **inactive** - Classroom is not currently in use
3. **maintenance** - Classroom is undergoing routine maintenance
4. **renovation** - Classroom is being renovated or remodeled
5. **closed** - Classroom is permanently closed

## Common Classroom Features

Common values for the `features` array include:

1. **projector** - Room has a projector
2. **smart_board** - Room has an interactive smart board
3. **air_conditioning** - Room has air conditioning
4. **computers** - Room has computers
5. **lab_equipment** - Room has laboratory equipment
6. **musical_instruments** - Room has musical instruments
7. **art_supplies** - Room has art supplies
8. **sports_equipment** - Room has sports equipment
9. **whiteboard** - Room has a whiteboard
10. **network_access** - Room has network/internet access

You can add custom features as needed.
