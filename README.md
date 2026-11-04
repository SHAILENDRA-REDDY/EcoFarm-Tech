# Eco Farm Tech

## Solar-Powered Electricity Generation for Sustainable Farming

Eco Farm Tech is a concept venture that uses solar panels to generate
clean electricity for agricultural activities. The electricity can
support irrigation pumps, farm lighting, and other farm equipment. A
monitoring dashboard helps the operator view energy generation,
consumption, and system status.

> **Project status:** Student venture concept / digital prototype. The
> dashboard values shown in this README are illustrative demo values,
> not readings from a live solar installation.

------------------------------------------------------------------------

## 1. Project Overview

### Problem

Farm operations depend on a reliable electricity supply for activities
such as water pumping and irrigation. Power interruptions and energy
expenses can affect farm productivity.

### Proposed solution

Eco Farm Tech proposes a solar-powered system that: - Generates
electricity from sunlight using photovoltaic (PV) panels. - Converts the
panels' DC output into usable AC electricity through an inverter. -
Supplies power to irrigation pumps and selected farm equipment. -
Optionally stores excess electricity in batteries, if storage is
included in the installation. - Monitors energy generation and
consumption through a digital dashboard.

### Main objectives

1.  Provide a renewable electricity source for farm operations.
2.  Reduce dependence on conventional grid electricity where practical.
3.  Monitor solar generation and farm energy usage.
4.  Support more efficient planning of irrigation and electrical loads.

------------------------------------------------------------------------

## 2. How the System Works

``` mermaid
flowchart LR
    A[Sunlight] --> B[Solar PV panels]
    B --> C[DC protection and combiner]
    C --> D[Inverter]
    D --> E[AC distribution and energy meter]
    E --> F[Irrigation pump]
    E --> G[Farm equipment and lighting]
    B -. Optional storage .-> H[Battery and charge controller]
    H -. Stored energy .-> D
    E --> I[Monitoring dashboard]
```

1.  **Solar panels:** Convert sunlight into direct-current (DC)
    electricity.
2.  **Protection equipment:** Helps protect the electrical system from
    faults and surges.
3.  **Inverter:** Converts DC electricity into alternating-current (AC)
    electricity when AC loads are used.
4.  **Energy meter:** Measures electricity generated, supplied, or
    consumed, depending on the metering arrangement.
5.  **Loads:** Electricity is used by irrigation pumps and other farm
    equipment.
6.  **Optional battery:** Stores energy for later use when a suitable
    battery system is installed.
7.  **Dashboard:** Displays available monitoring data so the operator
    can understand system performance.

The actual wiring, protection devices, grid connection, and installation
must be designed and installed by qualified solar/electrical
professionals and comply with applicable local requirements.

------------------------------------------------------------------------

## 3. Dashboard Preview

The dashboard is a proposed interface for monitoring the solar energy
system. The following is a **sample preview using fictional demo
values**.

### Eco Farm Tech --- Energy Monitoring Dashboard

  ------------------------------------------------------------------------
  Dashboard card                          Demo value What it means
  --------------------- ---------------------------- ---------------------
  Solar energy                              32.4 kWh Energy generated
  generated today                                    during the day

  Energy used by                            18.6 kWh Sample pump
  irrigation pump                                    consumption

  Energy used by other                       5.8 kWh Sample consumption by
  farm loads                                         other equipment

  Energy sent to                             6.0 kWh Example energy routed
  storage                                            to a battery, if
                                                     installed

  Battery level                                  82% Illustrative state of
                                                     charge; only shown
                                                     when a battery is
                                                     connected

  System status                               Normal Example status
                                                     indicator
  ------------------------------------------------------------------------

### Text wireframe

``` text
+--------------------------------------------------------------+
|                     ECO FARM TECH                            |
|              Solar Energy Monitoring Dashboard               |
+----------------------+----------------------+----------------+
| Generated Today      | Pump Energy Used     | Other Loads    |
|     32.4 kWh         |      18.6 kWh         |    5.8 kWh     |
+----------------------+----------------------+----------------+
| Battery Level*       | System Status        | Energy Overview|
|       82%            |       NORMAL          | Demo data      |
+----------------------+----------------------+----------------+
|                                                              |
|  Energy flow: Solar panels -> Inverter -> Meter -> Farm      |
|  Loads / Optional battery                                    |
|                                                              |
+--------------------------------------------------------------+
| *Battery information appears only if storage is installed.   |
| All numbers above are illustrative and are not live readings.|
+--------------------------------------------------------------+
```

### Suggested dashboard sections

-   **Overview:** Today's generation, consumption, and system status.
-   **Generation:** Daily, weekly, and monthly solar energy output.
-   **Consumption:** Energy used by the irrigation pump and other farm
    loads.
-   **Battery (optional):** Battery charge level, charging, and
    discharging status.
-   **Alerts:** Notifications for abnormal readings, inverter faults, or
    low battery state, if supported by connected hardware.
-   **Reports:** Downloadable summaries of generation and usage.

### Dashboard data and hardware

A working live dashboard would require compatible monitoring hardware
and a data connection, such as: - Inverter or solar generation
monitoring interface. - Energy meter or current/voltage sensors suitable
for the system. - Battery-management data, if a battery is installed. -
A controller or gateway to collect and transmit readings. - A software
application or web dashboard to display the data.

The concept preview in this README does not itself connect to hardware
or measure real electricity.

------------------------------------------------------------------------

## 4. Products and Services

Eco Farm Tech may offer: - Solar electricity systems for farms. -
Solar-powered irrigation pump solutions. - System installation and
commissioning through qualified installers. - Monitoring dashboard
access. - Periodic inspection and maintenance. - Optional battery
storage solutions.

The exact offering will depend on customer needs, system size, site
conditions, and applicable approvals.

------------------------------------------------------------------------

## 5. Revenue Model

### Primary model: Pay-per-use / electricity supplied

Where the business is legally permitted and technically set up to supply
electricity, customers may be charged according to the energy supplied
or consumed, measured in kilowatt-hours (kWh).

### Additional possible revenue streams

-   **System sales:** One-time sale of solar equipment and installation
    packages.
-   **Subscription:** Monthly or annual fee for monitoring, reporting,
    and support.
-   **Maintenance services:** Charges for inspection, cleaning, and
    repairs.
-   **Lease or service model:** Customers pay for use of a solar system
    without purchasing the equipment upfront, subject to contract and
    regulatory conditions.

The final model should be selected after checking the local
electricity-supply rules, grid-connection arrangements, and customer
requirements.

------------------------------------------------------------------------

## 6. Cost Structure

### A. Start-up costs

-   Solar PV modules.
-   Inverter(s).
-   Mounting structures and foundations.
-   DC and AC cables, connectors, and conduits.
-   Combiner boxes, isolators, circuit breakers, and surge protection.
-   Earthing and lightning protection.
-   Energy meter and monitoring equipment.
-   Optional batteries and charge controller / battery inverter.
-   Site preparation, fencing, and security arrangements.
-   Engineering, installation, testing, and commissioning.
-   Transportation, documentation, and applicable approvals.

### B. Fixed operating costs

-   Site or land lease, if applicable.
-   Employee and technician salaries.
-   Insurance.
-   Internet and monitoring software.
-   Security and administration.
-   Accounting and professional services.
-   Loan interest or finance charges, if applicable.

### C. Variable and maintenance costs

-   Panel cleaning and water.
-   Routine inspection and servicing.
-   Repairs and replacement parts.
-   Transport for maintenance visits.
-   Metering, grid, or wheeling charges, where applicable.
-   Battery maintenance and eventual replacement, if batteries are
    installed.

Costs depend on system capacity, location, equipment quality, land
requirements, financing, and grid connection. Obtain supplier quotations
and a site assessment before preparing a final project budget.

------------------------------------------------------------------------

## 7. Pricing and Costing Strategy

-   **Cost-plus pricing:** Estimate the cost per kWh or service cost,
    then add a reasonable margin.
-   **Value-based pricing:** Consider the value of reliable energy and
    potential savings for the farmer.
-   **Market-entry pricing:** Offer an introductory price to attract
    early customers, while ensuring operating costs are covered.
-   **Subscription pricing:** Charge a recurring fee for dashboard
    access and support.

Any electricity tariff or sale price must be checked against applicable
regulations and the actual supply arrangement. A sample classroom
calculation should not be presented as an approved tariff.

------------------------------------------------------------------------

## 8. Target Customers

-   Farmers using electric irrigation pumps.
-   Farmer Producer Organisations (FPOs).
-   Agricultural cooperatives.
-   Farmhouses and rural businesses.
-   Small agro-processing units.
-   Agricultural institutions and demonstration farms.

------------------------------------------------------------------------

## 9. Benefits

-   Uses renewable solar energy.
-   Can reduce dependence on conventional electricity.
-   Supports irrigation and other farm activities.
-   Provides visibility into energy generation and consumption.
-   Can be expanded based on energy demand and available space.
-   Contributes to more sustainable farm operations.

Actual savings and environmental benefits depend on the system design,
solar resource, usage pattern, equipment, financing, and maintenance.

------------------------------------------------------------------------

## 10. Risks and Considerations

-   Solar generation changes with weather, season, shading, and time of
    day.
-   Batteries add cost and require appropriate safety and maintenance.
-   Inverter and other equipment may need repair or replacement.
-   The project requires a suitable site and correctly designed
    electrical protection.
-   Grid export or third-party electricity sales may require specific
    approvals and agreements.
-   Financial projections should account for downtime, maintenance,
    insurance, and financing.

------------------------------------------------------------------------

## 11. Future Scope

-   Add live inverter and energy-meter integration.
-   Introduce mobile alerts for faults and abnormal energy usage.
-   Add irrigation scheduling based on available solar power.
-   Provide monthly energy reports to farmers.
-   Expand to additional farms or community solar installations, subject
    to feasibility and approvals.

------------------------------------------------------------------------

## 12. Conclusion

Eco Farm Tech proposes a solar-powered energy solution for agricultural
use, supported by a digital monitoring dashboard. By combining solar
generation, farm electricity usage, and clear energy reporting, the
venture aims to support cleaner and more informed farm operations.

**Note:** This README describes a proposed student venture and
illustrative digital dashboard. It is not a construction design,
electrical installation guide, live monitoring service, financial
guarantee, or regulatory approval.

------------------------------------------------------------------------

## 13. Dashboard Website (Prototype)

A static, dependency-free web prototype of the monitoring dashboard described
above lives in this repository. It presents the illustrative demo values from
this README together with farm-owner details, and is **not** connected to any
hardware.

```text
index.html          app shell: sidebar, header, all seven pages
css/styles.css      green + white design system, responsive layout
js/data.js          demo dataset (owner, generation, usage, reports)
js/app.js           hash routing, SVG charts, demo interactions
assets/             dashboard photography and sidebar artwork
```

**Pages:** Dashboard · Owner Profile · Solar Power · Farm Monitoring ·
Irrigation Control · Reports · Settings.

**Run locally:**

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

All figures shown (8.5 kW current output, 42.3 kWh generated today, 18.6 kWh
pump use, 6.0 kWh to storage, 82% battery, 68% usage split) are illustrative
samples, consistent with the demo values in section 3.
