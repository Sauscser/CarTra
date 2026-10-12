# A Plain-Language Guide to National CBE Analytics

## Why this guide exists

National CBE Analytics turns recorded learner marks into a national, grade-by-grade summary. It is intended to help education leaders understand:

- how recorded subject marks fall across CBE achievement levels;
- how learners' achieved marks compare with the targets set for them; and
- in Grades 10–12, how achieved course-cluster performance compares with learner targets and tertiary course minimums.

This guide explains each part of the screen, what its numbers mean, and what conclusions the data can and cannot support. It can also be used to introduce the dashboard in a presentation.

## The main idea: results and targets are different things

The analytics keeps three related ideas separate:

1. **Course-set requirements and benchmark.** A tertiary course defines the subject requirements and minimum CBE points for its cluster, as well as its seven-best-subject minimum. These course rules are used to calculate a tertiary benchmark.
2. **Learner-set targets.** A teacher records the target marks for a particular learner. For Grades 10–12, the learner's required subject targets can be combined into a learner-target cluster score.
3. **Achieved marks.** A teacher records the learner's actual performance. These achieved marks are what make a result an achievement record for the national charts.

Targets alone are not completed performance. A target can be saved before an achieved mark exists, but the charts do not count that target-only record as a result. When an achieved mark is recorded, the system can compare it with the learner's target and, for an eligible course cluster, with the tertiary benchmark.

## A tour of the screen

### 1. “Performance by grade”

This is the analytics workspace. The dashboard is organized around Grades **7, 8, 9, 10, 11, and 12**. Select a grade to focus the numbers and charts on that grade.

The dashboard is an analysis of results available to the system. It is not a forecast of future performance, a learner ranking, or a pass/fail decision.

### 2. The summary cards

The cards at the top provide a quick count for the selected grade and year:

- **Subject marks** — the number of recorded subject-mark entries represented in the current subject view. This is a count of marks, not a count of individual learners. One learner can contribute several subject marks.
- **Subjects represented** — the number of distinct subjects with recorded marks in the selected grade and year. It is not a count of learners or schools.
- **Career comparisons** — the number of eligible learner course-cluster comparisons against learner-set career targets. A learner is included only when the system has enough achieved cluster and target information to make that comparison.

Changing the grade or academic-year filter changes the population behind these figures. In the subject view, choosing a particular subject also changes the subject-mark count to that subject's marks.

### 3. Grade selector

Choose a grade from 7 to 12. Grade selection applies to the achievement-level distribution, deviations, and summary counts. Grades 10–12 also have the senior-secondary career-cluster comparison view.

### 4. Academic-year selector

Choose **All years** to combine available years for that grade, or choose one of the listed academic years to focus on it.

The year list is based on years present in the data. Some historical marks may appear under **Not recorded** when the learner profile contains a grade history but no academic year was saved for that historical mark. “Not recorded” is deliberately not assigned an invented year.

### 5. Achievement-level distribution: the donut/pie chart

This chart answers:

> **Among the subject marks currently included, how many fall into each configured CBE achievement band?**

The legend shows each achievement level, its count, and its share of the marks in the selected view. The number in the middle is the total number of subject marks included in that distribution.

#### How to read it

Suppose a selected view contains 100 subject marks and the legend shows 25 in one band. That band represents 25 of the 100 marks, or 25%. It does **not** mean 25% of all learners are in that band unless every learner contributed exactly one mark—which is not what this chart assumes.

The slices are based on achieved marks grouped into the national CBE achievement ranges. The national officer's configured ranges are used when valid ranges have been saved. If they have not been saved, the dashboard uses the application's default bands:

| Band | Default mark range |
|---|---:|
| BE1 | 0–9 |
| BE2 | 10–19 |
| AE1 | 20–29 |
| AE2 | 30–39 |
| ME1 | 40–57 |
| ME2 | 58–74 |
| EE1 | 75–89 |
| EE2 | 90–100 |

The labels and ranges may be configured nationally; the default table above applies only when a valid national configuration is unavailable. If defaults are being used, the dashboard displays a notice.

For Grades 10–12, support subjects are excluded from the subject achievement and subject-target charts. That keeps the displayed senior-secondary subject view focused on the subjects included by the analytics rules.

**The pie is a mark distribution, not a learner distribution.** A learner with marks recorded in six subjects can contribute six entries. Do not describe the slices as percentages of learners.

### 6. Deviation distributions: two modes

This section has two selectable modes:

- **Subject targets**
- **Career clusters**

Both modes use percentage deviation from a target. Their curves summarize the spread of those comparisons.

#### Understanding the axes

- **X-axis — achieved score versus benchmark, in percent.** (Each value is how far an achieved subject mark or career-cluster score is above or below its matching learner target or tertiary course minimum, calculated as `(achieved score − benchmark) ÷ benchmark × 100`.) Zero means the achieved score equals its benchmark. A negative value means it is below; a positive value means it is above.
- **Gaussian probability density chart — Y-axis is density per percentage point.** (At each x-axis value, this is the height of a fitted Gaussian probability-density curve calculated from the collected deviations' count, mean, and standard deviation.) The area under a section of the curve gives the model's probability for that range of deviations. A y-value by itself is **not** a probability, learner count, or percentage of learners.
- **Peak-normalized relative-height chart — Y-axis runs from 0.00 to 1.00.** (At each x-axis value, this is the fitted curve's height divided by its own peak.) A value of 1.00 marks the curve's peak; lower values show how far the fitted curve is below its peak. This unitless height is **not** a probability, learner count, or percentage of learners.
- **Cumulative modeled probability chart — Y-axis runs from 0% to 100%.** At each x-axis value, it estimates the percentage of deviations at or below that value according to the fitted Gaussian. At **x = 0%**, it estimates the percentage at or below the benchmark.

All charts use the same x-axis values and fitted curves. A dashed vertical line marks **0%** when it is within the displayed range. Each curve's legend shows its **n** (number of comparisons), **mean** (μ), and **standard deviation** (SD); on the cumulative chart it also shows the modeled percentage at or below the benchmark. The cumulative chart is available in national, regional, county, sub-county, and school analytics, including when officers drill down into lower-level jurisdictions. Relative heights should not be used to compare the number of learners between curves; use **n** and the summary count for the number plotted.

The dashboard fits a normal-shaped curve from aggregated deviation statistics. It is a descriptive view of the pattern, not a pass/fail threshold and not a guarantee that the underlying data follows a true normal distribution.

#### An axis tick is not the mean

The labeled positions under each chart are **axis ticks**. They identify locations on the horizontal scale; they are not calculated by averaging learners' deviations. The tick at the midpoint between the displayed left and right ends can be nonzero when the range is asymmetric around zero. For example, if the axis runs from **−25% to +50%**, its midpoint is **(−25% + 50%) ÷ 2 = +12.5%**, displayed rounded as **+13%**.

The **Mean learner-target deviation**, by contrast, is calculated from the included comparisons: add their individual percentage deviations and divide by the number of comparisons. For example, with four subject deviations of **+10%, −10%, +20%, and −10%**, the mean is **(+10 − 10 + 20 − 10) ÷ 4 = +2.5%**. The fitted curves are centered around that mean; axis ticks are determined by the displayed axis range. If the axis runs from **−50% to +50%**, its middle tick is **0%**, even though the example mean is **+2.5%**.

For readers who want to know how the plotted line is produced: the reporting system groups deviations into five-percentage-point bins for aggregation, while retaining the count, sum, and sum of squares of the actual deviations. The UI combines those statistics to calculate the mean and spread:

- **Mean (μ) = sum of deviations ÷ count**
- **Variance = (sum of squared deviations ÷ count) − μ²**
- **Standard deviation (σ) = square root of the variance** (with a minimum of 1 percentage point so a zero-spread set can still be drawn)

It then evaluates Gaussian formulas at positions **x** across the horizontal axis. In all charts, **x** is the percentage deviation of an achieved score from its matching benchmark; each labeled x-axis tick gives that percentage difference. The first chart plots the Gaussian probability density:

**density(x) = exp(−½ × ((x − μ) ÷ σ)²) ÷ (σ × √(2π))**

Here, **exp** means the exponential function and **π** is pi. The density's units are “per percentage point”; the area under the curve across a range, rather than its height at one point, represents the fitted model's probability for that range. The second chart shows the peak-normalized relative height:

**relative height(x) = exp(−½ × ((x − μ) ÷ σ)²)**

This divides the density at each x by its peak density, so the peak is 1.00. The national account also plots the cumulative modeled probability, the normal CDF:

**cumulative probability(x) = 100 × P(X ≤ x)**

It gives the fitted model's estimated percentage at or below each x-value. For example, reading the cumulative curve where **x = 0%** gives the estimated share at or below the benchmark. The charts connect sampled positions to draw smooth fitted lines. They summarize the mean and spread of the collected data; they do not trace individual results or establish that actual deviations follow a Gaussian distribution. Extreme bins are capped for aggregation, so the far ends of the curves should not be treated as precise counts at an exact deviation.

### 7. Subject-target curve

In **Subject targets** mode, the curve summarizes eligible achieved subject marks compared with the learner-set target for the same subject.

For one subject comparison:

**Deviation (%) = ((achieved mark − learner target) ÷ learner target) × 100**

For example:

- Achieved **84**, target **70** → **+20%**: achieved is 20% above target.
- Achieved **60**, target **75** → **−20%**: achieved is 20% below target.
- Achieved **70**, target **70** → **0%**: achieved equals target.

The target must be positive and the achieved mark must be present for the comparison to be included. A subject mark without a usable target can still appear in the achievement-level pie, but it cannot contribute to the subject-target curve.

Use **All subjects** to summarize all eligible subjects in that grade, or search and choose a subject chip to focus on one subject. The chips are based on subjects represented by recorded marks.

### 8. Career-cluster curves

In **Career clusters** mode, the chart can show two curves:

- **Learner career targets** — achieved cluster scores compared with each learner's target cluster score.
- **Tertiary course minimums** — achieved cluster scores compared with the benchmark derived from the selected tertiary course's minimum requirements.

These are two different questions:

1. Did learners reach the targets set for them?
2. How did achieved cluster scores compare with the relevant tertiary course minimum?

For each comparison, the same percentage-deviation formula applies:

**Deviation (%) = ((achieved cluster score − benchmark) ÷ benchmark) × 100**

Zero means the achieved cluster score exactly matches that benchmark. Negative means below; positive means above.

#### How a cluster score is assembled

The system maps a subject's achieved mark into its applicable CBE achievement band and then into a point value on the eight-point scale:

| Achievement band | Points |
|---|---:|
| BE1 | 1 |
| BE2 | 2 |
| AE1 | 3 |
| AE2 | 4 |
| ME1 | 5 |
| ME2 | 6 |
| EE1 | 7 |
| EE2 | 8 |

The configured achievement ranges determine which band a mark enters. Course requirements are arranged into requirement groups. If a group allows alternatives, the scoring calculation uses the best achieved eligible alternative in that group. The calculation then combines the required cluster subjects with the best other eligible subjects, up to seven subjects total. Support subjects are excluded from this cluster calculation.

In simplified terms, the learner's cluster score reflects both:

- how the learner performed in the course-required subject groups; and
- how the learner performed across the seven-best-subject set.

The calculation uses the actual configured course requirements, including its subject groups, alternative rules, achievement ranges, and seven-best minimum. It is not simply an average of all marks.

#### How the tertiary benchmark is assembled

The tertiary benchmark is derived from the course configuration:

- the minimum points for each required-subject group (using the least demanding configured alternative for a group); and
- the course's seven-best-subject minimum.

This is why **tertiary course minimums are course-specific**. They are not a single national pass mark that applies equally to every career or course.

#### Worked example (illustrative only)

Assume a course has four required-subject groups, so the cluster maximum is 4 × 8 = **32 points**. Suppose a learner's target subjects contribute **24 cluster points** and **35 seven-best points**. The learner-target cluster score is:

**(24 ÷ 32) × (35 ÷ 56) × 32 = 15**

Suppose the learner's achieved subjects contribute **28 cluster points** and **42 seven-best points**:

**(28 ÷ 32) × (42 ÷ 56) × 32 = 21**

In this example, the achieved score is **40% above the learner target**: (21 − 15) ÷ 15 × 100. If the course's derived tertiary benchmark were 9 points, the achieved score would be **133.3% above that benchmark**: (21 − 9) ÷ 9 × 100.

These numbers are only to demonstrate the formula. They are not a national threshold or a promise of admission.

#### What the career curve can tell you

- If a curve is centered to the **left of zero**, recorded achieved cluster scores tend to be below that benchmark.
- If it is centered to the **right of zero**, they tend to be above it.
- A **narrower curve** means recorded deviations are more concentrated near their average.
- A **wider curve** means a wider spread of deviations.
- The **n** beside each curve is the number of comparisons contributing to that curve.

The two curves may have different n values. A learner may have enough information for one comparison but not the other.

The summary row named **Mean learner-target deviation** reports the average deviation for the first curve in the selected mode. In Career clusters mode, that is the learner-career-target curve; it is not the mean deviation from tertiary minimums.

### 9. Counts, completeness, and “Not recorded”

The analytics uses national annual rollups when available. Those rollups are created from annual performance facts with achieved marks. If a grade has no rollup data, the National screen can build a read-time fallback from annual facts and historical learner-profile marks.

Some historical profile marks do not contain an academic year. These are displayed under **Not recorded**, and the dashboard warns that they have an unknown year. They can help make historical performance visible, but should not be presented as verified results for a particular year.

When the fallback is run for a grade with no rollup data, annual facts with achieved marks take precedence over profile history for the same learner/grade/subject. This avoids counting that same learner/grade/subject again as a separate historical mark. Grades that already have rollup data are not supplemented with profile history by this fallback.

The current dashboard's counts describe available **records**, not the proportion of all enrolled learners represented. It does not currently show a national enrollment denominator or a completeness percentage. Before making a national trend claim, check:

- the selected grade and year;
- the number of subject marks and comparisons;
- whether historical marks are labeled “Not recorded”;
- whether the achievement-range notice says defaults are being used; and
- whether the participating schools and learners provide adequate coverage for the conclusion.

### 10. What the analytics does not claim

National CBE Analytics:

- does not predict a learner's future result;
- does not determine admission or certify that a learner has passed;
- does not equate one subject mark with one learner;
- does not treat saved targets as achieved results;
- does not imply that every learner in the nation is represented;
- does not turn unknown historical years into known academic years; and
- does not make a course-specific tertiary benchmark a universal national benchmark.

It is a descriptive tool for understanding recorded outcomes and comparing results with explicit targets.

## 11. School and local-government analytics

The same analysis is available from each local dashboard at the scope of the signed-in officer's assigned organisation:

- **School / principal:** learners recorded for that school.
- **Sub-county:** learners recorded for that sub-county.
- **County:** learners recorded for that county.
- **Region:** learners recorded for that region.

National officers can also open **Explore by jurisdiction** beneath the national charts and select a region. The selected region's analytics appear with a list of its counties; selecting a county reveals its analysis and sub-counties, then a selected sub-county reveals its analysis and schools, and selecting a school shows the school-level analysis. Regional officers start at their assigned region and can cascade through counties, sub-counties, and schools; county officers start at their county and can cascade through sub-counties and schools; sub-county officers start at their sub-county and can cascade through schools. Each level uses the same scoped charts as the corresponding officer dashboard.

These views reuse the grade, year, subject, achievement-band, and deviation calculations above. Annual performance records are saved with their nation, region, county, sub-county, and school codes. The local analytics query uses the nation's grade index together with an exact organisation-code filter, so only matching annual records are returned to the screen. Historical marks are loaded from learner profiles filtered to the same organisation. Where a learner has both a saved annual fact and a profile-history mark for the same learner, grade, and subject, the annual fact takes precedence.

This scope is based on the organisation codes saved with each performance fact, not on a later inference from a learner's current school assignment. The figures therefore summarize recorded facts associated with the selected jurisdiction. As with the national view, counts describe available marks and comparisons, not the full enrolled-learner population.

## A simple way to present the dashboard

> “National CBE Analytics gives leaders a grade-by-grade view of recorded learner performance. The achievement chart shows how subject marks are distributed across configured CBE levels. The subject-target curve shows how achieved marks compare with targets set for learners. For senior-secondary grades, the career-cluster view compares achieved course-cluster scores both with learner targets and with the minimum benchmarks attached to the selected tertiary courses. Leaders can filter by grade, subject, and academic year to explore the patterns. These are summaries of captured results—not forecasts or pass/fail decisions—and historical marks without a known year are kept visibly separate.”

## A short interpretation checklist

Before explaining a chart to an audience, ask:

1. Which grade is selected?
2. Which academic year (or “All years”) is selected?
3. Is this the subject view or the career-cluster view?
4. Is the chart counting marks, comparisons, or distinct subjects?
5. Is the curve above or below zero, and what benchmark is it comparing against?
6. What is the n for each curve?
7. Are any marks labeled “Not recorded”?
8. Do the available records justify a national conclusion, or only a description of the records currently captured?

---

### Implementation reference

This explanation follows the current analytics UI and scoring rules in:

- `src/components/shared/NationalCbeAnalytics.tsx`
- `src/components/shared/ScopedCbeAnalytics.tsx`
- `src/utils/nationalCbeAnalytics.ts`
- `src/utils/cluster.ts`
- `src/screens/National/index.tsx`
- `amplify/backend/function/nationalcberollup/src/index.js`
