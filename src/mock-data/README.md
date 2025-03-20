# Mock Data Structure

This directory contains mock data files that simulate the Audiense Demand API responses. The data follows a specific structure defined in `../schemas/demand-data.ts`.

## Directory Structure

```
mockReportId/
├── demand_data/           # Raw platform data
│   ├── instagram/         # Instagram-specific data
│   ├── google/           # Google search data
│   ├── youtube/          # YouTube data
│   ├── tiktok/          # TikTok data
│   ├── twitter/         # Twitter data
│   └── url/             # URL data
├── demand_score/         # Aggregated demand scores
└── entities/            # Entity information
```

## CSV File Structure

All platform data files follow this common structure:

| Column      | Description                                          | Example                   |
|-------------|------------------------------------------------------|---------------------------|
| id          | Unique identifier for the entity (UUID)              | b83eadf8-4908-4c65-ad20-9e95cc60c7c8 |
| name        | Entity name                                          | Angelina Jolie           |
| reference   | Reference identifier                                 | angelinajolie            |
| term        | Search term or username                              | angelinajolie            |
| platform    | Platform name                                        | instagram                |
| segment     | Geographic segment                                   | Global, US, GB           |
| variable    | Metric type                                         | Engagement Rate          |
| value       | The actual value for the metric                     | 0.053962                 |
| absolute    | Absolute value (typically 1 for rates)              | 1                        |
| weight      | Weighting factor                                    | 1                        |
| timestamp   | Data collection timestamp                           | 2025-03-20 11:46:23      |

## Platform-Specific Metrics

### Instagram
- Followers
- Male Followers
- Female Followers
- Followers Age
- Male Followers Age
- Female Followers Age
- Engagement Rate

### Google
- Search Volume
- YoY Change

### YouTube
- Subscribers
- Search Volume

## Example Data

```csv
id,name,reference,term,platform,segment,variable,value,absolute,weight,timestamp
b83eadf8-4908-4c65-ad20-9e95cc60c7c8,Angelina Jolie,angelinajolie,angelinajolie,instagram,Global,Engagement Rate,0.053962,1,1,2025-03-20 11:46:23
b83eadf8-4908-4c65-ad20-9e95cc60c7c8,Angelina Jolie,angelinajolie,angelinajolie,instagram,US,Followers,1196116,0.07800394481690905,1,2025-03-20 11:46:23
```

## Usage

When creating new mock files:
1. Follow the CSV structure exactly as shown above
2. Use valid UUIDs for the `id` field
3. Maintain consistent timestamp formats (ISO format)
4. Follow the naming convention: `[Report_Name]_[platform]_data_1.csv`
5. Place files in the appropriate platform directory under `demand_data/`

For more details about the schema and validation, see `../schemas/demand-data.ts`.