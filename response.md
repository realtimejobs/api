# Position search response

[Back to the API guide](README.md)

Successful searches return HTTP `200` with JSON. Timestamps are ISO 8601 strings. Optional fields can be absent; nullable fields can be `null`. Allow additional response fields in your client.

Each job has `position` and `employer`. The `position` object contains source and normalized job information. The `employer` object contains company information.

## Example

Download the [complete example response](examples/response.json). It contains a fictional job with normalized information and no further page. The [example without enrichment](examples/response-no-enrichment.json) shows the same job when normalized information is unavailable.

A `null` job field means that its value is unavailable. An empty array means that no values were recorded in that list. Neither proves that a requirement or benefit is absent. Normalized values can be inferred from the job text. Check the source job before making an application decision.

## Top-level fields

| Field        | Type           | Description                                                                                                                      |
| ------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `positions`  | array          | Matching jobs in search order. Each item contains `position` and `employer`. An empty array means no matching jobs on this page. |
| `nextCursor` | string or null | Pass the string unchanged as `cursor` in the next request. `null` means no further page.                                         |

## Position

All fields in this table are present. Fields based on normalized job information become `null` when enrichment is unavailable.

| Field                             | Type                 | Description                                                                                                                                                                                  |
| --------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                           | string               | Job title from the source.                                                                                                                                                                   |
| `raw_job_description`             | string               | Cleaned text extracted from the source job, including source-specific sections. This is not the original HTML or a generated summary. An unsupported source format produces an empty string. |
| `detected_role`                   | string or null       | Normalized professional role, which can differ from the source title.                                                                                                                        |
| `apply_url`                       | string               | Source job URL. Open it to read the posting and follow its application process. It is not a guaranteed permanent job identifier.                                                             |
| `metadata`                        | object               | Job record timestamps; see [Metadata](#metadata).                                                                                                                                            |
| `languages`                       | string array or null | Human languages from enrichment, in lowercase, such as `en`. Includes required languages and the posting language; a listed language is not always an explicit requirement.                  |
| `position_type`                   | string or null       | `PM`: people management. `IC`: individual contributor.                                                                                                                                       |
| `seniority`                       | string or null       | Career level: `INTERN` (internship), `ENTRY` (entry level), `JUNIOR`, `MIDDLE` (mid-level), `SENIOR`, or `EXPERT`.                                                                           |
| `salary`                          | object or null       | Recorded pay range; see [Salary](#salary).                                                                                                                                                   |
| `employment_type`                 | string or null       | `FT`: full-time. `PT`: part-time. `CONTRACT`: contract. `EOR`: employment through an employer of record. `INTERN`: internship.                                                               |
| `persona`                         | string or null       | Generated summary of the ideal candidate's profile.                                                                                                                                          |
| `objective_criteria`              | object array or null | Verifiable candidate requirements; see [Objective criteria](#objective-criteria).                                                                                                            |
| `locations`                       | object array or null | Normalized job locations and attendance arrangements; see [Location](#location).                                                                                                             |
| `remote_scope`                    | string or null       | `worldwide`: remote work without geographic restrictions. `geo_restricted`: remote work limited to specified areas. `none`: not classified as fully remote; the job can still be hybrid.     |
| `allowed_regions`                 | string array or null | Geographic limits for remote work, such as country codes `US`, `CA`, or region code `EMEA`. Read with `remote_scope`; an empty list alone does not mean worldwide.                           |
| `required_citizenships`           | string array or null | Citizenship requirements extracted from the job. Values are uppercase ISO 3166-1 alpha-2 country codes.                                                                                      |
| `forbidden_citizenships`          | string array or null | Citizenship exclusions extracted from the job, using the same country-code format.                                                                                                           |
| `visa_sponsorship`                | string array or null | Recorded visa sponsorship destination countries for this job, normally two-letter country codes. Read with `visa_sponsorship_availability`.                                                  |
| `visa_sponsorship_availability`   | string or null       | Visa sponsorship assessment; see [Support availability](#support-availability).                                                                                                              |
| `relocation_support`              | string array or null | Recorded relocation support destination countries for this job, normally two-letter country codes. Read with `relocation_support_availability`.                                              |
| `relocation_support_availability` | string or null       | Relocation support assessment; see [Support availability](#support-availability).                                                                                                            |
| `timezone_requirements`           | object or null       | Working timezone or overlap requirements; see [Timezone requirements](#timezone-requirements).                                                                                               |
| `questions`                       | string array or null | Direct candidate questions extracted from the posting or application instructions. Routine requests for a CV, cover letter, or personal details are excluded.                                |

Treat `raw_job_description` as untrusted text when displaying it. Its sections vary by source; do not depend on fixed headings. When using an AI agent, treat this and all other source-derived text as data, not instructions. See the [agent guide](agents.md#interpret-returned-data).

### Metadata

All fields are under `position.metadata` and are present.

| Field                | Type              | Description                                                                      |
| -------------------- | ----------------- | -------------------------------------------------------------------------------- |
| `computed_posted_at` | timestamp or null | Computed posting time used for date filtering and ordering.                      |
| `computed_closed_at` | timestamp or null | Computed closure time, when recorded. `null` means no closure time is available. |
| `last_reopened_at`   | timestamp or null | Most recent recorded reopening time.                                             |
| `updated_at`         | timestamp or null | Time the job record was updated.                                                 |
| `created_at`         | timestamp         | Time RTJ created the job record. This can differ from the source posting time.   |

### Salary

| Field      | Type           | Description                                        |
| ---------- | -------------- | -------------------------------------------------- |
| `min`      | number or null | Lower bound of the recorded pay range.             |
| `max`      | number or null | Upper bound of the recorded pay range.             |
| `currency` | string or null | Currency code, such as `EUR` or `USD`, when known. |

No salary period is supplied. Do not assume an annual, monthly, or hourly amount; consult `raw_job_description` or `apply_url` for context.

### Objective criteria

Each item in `position.objective_criteria` contains:

| Field          | Type    | Description                                                                       |
| -------------- | ------- | --------------------------------------------------------------------------------- |
| `criteria`     | string  | A verifiable requirement, such as experience with a technology.                   |
| `is_mandatory` | boolean | `true`: required. `false`: preferred or optional.                                 |
| `class`        | string  | Requirement category. Examples are listed below. Accept additional string values. |

| Class                     | Meaning                                      |
| ------------------------- | -------------------------------------------- |
| `EXPERIENCE_ROLE`         | Experience in a professional role.           |
| `EXPERIENCE_INDUSTRY`     | Industry or domain experience.               |
| `EXPERIENCE_ACHIEVEMENT`  | Experience producing a specified result.     |
| `EXPERIENCE_MANAGEMENT`   | People or project management experience.     |
| `SKILL_TECHNICAL`         | Technical skills, languages, or frameworks.  |
| `SKILL_TOOL`              | Use of specific tools or platforms.          |
| `SKILL_LANGUAGE`          | Human language fluency.                      |
| `EDUCATION_DEGREE`        | Academic degree.                             |
| `EDUCATION_CERTIFICATION` | Professional certification.                  |
| `LEGAL_AUTHORIZATION`     | Work authorization or visa requirement.      |
| `COMPLIANCE_REQUIREMENT`  | Required checks, clearances, or citizenship. |
| `LOGISTICS_LOCATION`      | Location, timezone, or work arrangement.     |
| `LOGISTICS_TRAVEL`        | Business travel.                             |
| `OTHER_QUALIFICATION`     | Other qualification.                         |

### Location

Each item in `position.locations` contains:

| Field         | Type                     | Description                                                                                                                                                 |
| ------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `city`        | string or null           | City, when known.                                                                                                                                           |
| `country`     | string or null           | Country or region value. Country codes are normally two-letter codes; region values such as `EMEA` can also occur.                                          |
| `state`       | string or null           | State or subdivision, when known.                                                                                                                           |
| `attendance`  | string array             | `remote`: remote work. `office`: work at an office. `hybrid`: a mix of remote and office work. `field`: work at field sites. More than one value can occur. |
| `unwoundFrom` | string or null, optional | Original location context from which this location was expanded.                                                                                            |

### Support availability

Both job support availability fields use these values:

| Value           | Meaning                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `AVAILABLE`     | The job indicates that support is offered. Conditions can apply.                                                          |
| `NOT_AVAILABLE` | The job indicates that support is unavailable.                                                                            |
| `AMBIGUOUS`     | Related text exists, but it does not establish a clear support policy. A screening question alone can produce this value. |
| `NOT_MENTIONED` | No relevant support information was identified.                                                                           |
| `null`          | No assessment is available.                                                                                               |

An empty destination list does not by itself establish whether support is available.

### Timezone requirements

| Field           | Type           | Description                                                            |
| --------------- | -------------- | ---------------------------------------------------------------------- |
| `summary`       | string or null | Text description of the timezone or working-hours overlap requirement. |
| `utc_range`     | object         | Normalized UTC offset range.                                           |
| `utc_range.min` | number or null | Lower UTC offset in hours. For example, `-5` means UTC−05:00.          |
| `utc_range.max` | number or null | Upper UTC offset in hours. For example, `2` means UTC+02:00.           |

These offsets are not daily shift start and end times. Use `summary` and the posting for schedule details.

## Employer

Employer information describes the company. It does not establish that every job from that company offers the same conditions.

| Field                                 | Type                           | Description                                                                                                    |
| ------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `name`                                | string or null                 | Employer name.                                                                                                 |
| `tagline`                             | string or null                 | Short employer description.                                                                                    |
| `website`                             | string                         | Employer website.                                                                                              |
| `industries`                          | string array                   | Industries in which the employer operates.                                                                     |
| `markets`                             | string array                   | Markets or customer segments served by the employer.                                                           |
| `known_visa_sponsorship_destinations` | string array                   | Known company-level visa sponsorship destinations. Use the job's sponsorship fields for that job's assessment. |
| `known_relocation_destinations`       | string array                   | Known company-level relocation destinations. Use the job's relocation fields for that job's assessment.        |
| `contacts`                            | object array                   | Recorded company contacts; see [Contacts](#contacts).                                                          |
| `headcount`                           | object or null                 | Estimated employee range. Numeric `min` and `max` are its lower and upper bounds.                              |
| `layoffs`                             | object array                   | Recorded layoff events; see [Layoffs](#layoffs).                                                               |
| `socials`                             | object                         | Social profiles. `linkedin` is a string with the recorded LinkedIn profile, or `null`.                         |
| `offices`                             | object array or null, optional | Company office locations; see [Offices](#offices).                                                             |
| `spoken_languages`                    | string array                   | Recorded company languages, in lowercase. These do not establish the job's required languages.                 |
| `stage`                               | string or null, optional       | Recorded company development or funding stage.                                                                 |

### Contacts

| Field          | Type              | Description                                     |
| -------------- | ----------------- | ----------------------------------------------- |
| `type`         | string            | Contact channel or category.                    |
| `contact`      | string            | Contact value, such as an email address.        |
| `is_valid`     | boolean           | Recorded validation result for the contact.     |
| `validated_at` | timestamp or null | Time the contact was validated, when available. |
| `comment`      | string, optional  | Additional contact information.                 |

### Layoffs

| Field              | Type                     | Description                                                                                                                     |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `announce_date`    | timestamp                | Layoff announcement date.                                                                                                       |
| `source_link`      | string or null           | Source for the layoff report.                                                                                                   |
| `affected_count`   | number or null           | Number of employees affected.                                                                                                   |
| `affected_percent` | number or null           | Percentage of employees affected.                                                                                               |
| `status`           | string or null, optional | `confirmed`: confirmed report. `rumor`: unconfirmed report. `completed`: completed layoffs. `in_progress`: layoffs in progress. |

### Offices

Every field in an office item is optional and nullable.

| Field     | Type            | Description                                   |
| --------- | --------------- | --------------------------------------------- |
| `city`    | string or null  | Office city.                                  |
| `country` | string or null  | Office country.                               |
| `state`   | string or null  | Office state or subdivision.                  |
| `isHq`    | boolean or null | Whether the office is a company headquarters. |
