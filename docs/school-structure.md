# School Data Model Structure

This document outlines the relationship between different entities in the school database system.

## Overview

The school data model is organized around the central `School` entity, with various related entities that describe different aspects of the school's organization and operation.

```
School
  |
  |-- Departments
  |-- Grades
  |-- Sections
  |-- Categories
  |-- Subjects
  |-- Blocks (Buildings)
  |-- Teachers
  |-- Addresses
```

## Core Entities

### School

The main entity representing an educational institution.

### Blocks (Buildings)

Blocks represent physical buildings or wings within a school. Each block contains multiple classrooms and has properties like:

- Name (e.g., "Science Block", "Main Building", "A Block")
- Number of classrooms
- Year built
- Current status
- Physical location within the campus

### Departments

Academic or administrative units within the school (e.g., Science Department, Arts Department).

### Grades

Grade levels or forms/standards in the school (e.g., Grade 1, Grade 2, Form 1, Form 2).

### Sections

Divisions within grades (e.g., Grade 1A, Grade 1B, Form 1N1, Form 1N2).

### Subjects

Academic subjects taught in the school (e.g., Mathematics, Physics, English).

### Categories

Custom categories for organizing school resources or activities.

### Teachers

Staff members who teach subjects.

## Entity Relationships

### School to Blocks (Buildings)

- A school has many blocks (one-to-many)
- A block belongs to exactly one school (many-to-one)

### School to Departments

- A school has many departments (one-to-many)
- A department belongs to exactly one school (many-to-one)

### School to Grades

- A school has many grades (one-to-many)
- A grade belongs to exactly one school (many-to-one)

### School to Sections

- A school has many sections (one-to-many)
- A section belongs to exactly one school (many-to-one)

### School to Subjects

- A school has many subjects (one-to-many)
- A subject belongs to exactly one school (many-to-one)

### School to Teachers

- A school has many teachers (one-to-many)
- A teacher belongs to exactly one school (many-to-one)

## Block-Related Structure

Blocks (buildings) are an important part of the physical school infrastructure. They represent distinct physical areas within a school campus where educational activities take place.

```
School
  |
  |-- Block 1 (Science Building)
  |     |-- 10 Classrooms
  |     |-- Location: "North Campus"
  |     |-- Year Built: 1995
  |     |-- Status: "active"
  |
  |-- Block 2 (Main Building)
  |     |-- 15 Classrooms
  |     |-- Location: "Central Campus"
  |     |-- Year Built: 1990
  |     |-- Status: "active"
  |
  |-- Block 3 (Arts Wing)
        |-- 8 Classrooms
        |-- Location: "South Campus"
        |-- Year Built: 1997
        |-- Status: "active"
```

## Database Schema

Below is a simplified representation of the block-related database schema:

### blocks Table

| Column             | Type      | Description                             |
| ------------------ | --------- | --------------------------------------- |
| id                 | UUID      | Primary key                             |
| schoolId           | UUID      | Foreign key to schools table            |
| name               | VARCHAR   | Name of the block                       |
| numberOfClassrooms | INTEGER   | Number of classrooms in the block       |
| details            | TEXT      | Detailed description                    |
| location           | VARCHAR   | Location within the school campus       |
| yearBuilt          | INTEGER   | Year the block was constructed          |
| status             | VARCHAR   | Current status (active, inactive, etc.) |
| createdAt          | TIMESTAMP | Creation timestamp                      |
| updatedAt          | TIMESTAMP | Last update timestamp                   |

## Use Cases for Block Management

1. **Campus Planning**: Track and manage different buildings on a school campus
2. **Resource Allocation**: Assign teachers and classes to specific blocks based on subject needs
3. **Maintenance Scheduling**: Monitor block status for maintenance planning
4. **Capacity Planning**: Track total classroom capacity across all blocks
5. **Historical Records**: Maintain information about construction dates and renovations
6. **Block-specific Activities**: Organize activities based on block locations
7. **Emergency Planning**: Document building layouts for emergency protocols

## Future Extensions

The block model could be extended to include:

1. **Classroom Entity**: Add individual classrooms with specific details
2. **Floor Plans**: Store digital floor plans for each block
3. **Facility Tracking**: Track specialized facilities within each block (labs, libraries, etc.)
4. **Equipment Inventory**: Link equipment inventory to specific blocks
5. **Block Scheduling**: Implement block-specific scheduling for room usage
