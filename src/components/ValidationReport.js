
import {
    d2Fetch,
    fetchIndicators,
    fetchIndicatorsFromDataStore,
} from "../js/utils.js";

var indicators = false;
var operands = false;
var dataElements = false;
var updatedIndicators = false;
var systemInfo = false;
var dataSets = false;
var indicatorsConf = {};
var indicatorsUnconf = {};
var exchanges = false;
var root_orgunit = false;
var metadataPackage = false;

const iso3_codes = [
    "AFG",
    "ALB",
    "AGO",
    "ARM",
    "AZE",
    "BGD",
    "BLR",
    "BLZ",
    "BEN",
    "BTN",
    "BOL",
    "BWA",
    "BFA",
    "BDI",
    "CPV",
    "KHM",
    "CMR",
    "CAF",
    "TCD",
    "COL",
    "COM",
    "COG",
    "COD",
    "CRI",
    "CIV",
    "CUB",
    "DJI",
    "DOM",
    "ECU",
    "EGY",
    "SLV",
    "ERI",
    "SWZ",
    "ETH",
    "FJI",
    "GAB",
    "GMB",
    "GEO",
    "GHA",
    "GTM",
    "GIN",
    "GNB",
    "GUY",
    "HTI",
    "HND",
    "IND",
    "IDN",
    "IRN",
    "JAM",
    "KAZ",
    "KEN",
    "PRK",
    "XXK",
    "KGZ",
    "LAO",
    "LSO",
    "LBR",
    "MDG",
    "MWI",
    "MYS",
    "MLI",
    "MRT",
    "MUS",
    "MDA",
    "MNG",
    "MNE",
    "MAR",
    "MOZ",
    "MMR",
    "NAM",
    "NPL",
    "NIC",
    "NER",
    "NGA",
    "PAK",
    "PNG",
    "PRY",
    "PER",
    "PHL",
    "RUS",
    "RWA",
    "STP",
    "SEN",
    "SRB",
    "SLE",
    "SLB",
    "SOM",
    "ZAF",
    "SSD",
    "LKA",
    "SDN",
    "SUR",
    "TJK",
    "TZA",
    "THA",
    "TLS",
    "TGO",
    "TUN",
    "TKM",
    "UGA",
    "UKR",
    "UZB",
    "VUT",
    "VEN",
    "VNM",
    "YEM",
    "ZMB",
    "XZB",
    "ZWE",
];

var indicatorpTypes = {
    MONTHLY: [],
    QUARTERLY: [],
    YEARLY: [],
};

const allowed_implementer_types = [
    {
        name: "Governmental Organization",
        id: "HXEkCx9uasx",
    },
    {
        name: "United Nations Development Programme",
        id: "ddY6CWfWwoX",
    },
    {
        name: "Local Private Sector",
        id: "WqYrHai9gYJ",
    },
    {
        name: "Other Multilateral Organization",
        id: "KuPZumnAA3k",
    },
    {
        name: "Faith Based Organization",
        id: "izUdgJ2ixiI",
    },
    {
        name: "Ministry of Finance",
        id: "ldI7bQZyhIM",
    },
    {
        name: "Other Entity",
        id: "buBCzm4Q9py",
    },
    {
        name: "Other Governmental Organization",
        id: "iCCfsjluy7r",
    },
    {
        name: "International Private Sector",
        id: "S2So8oWX78q",
    },
    {
        name: "International Faith Based Organization",
        id: "jK7wYMb7ZcV",
    },
    {
        name: "Other Community Sector Entity",
        id: "BBHddcb1ZVr",
    },
    {
        name: "United Nations Organization",
        id: "Kg346mmQUxe",
    },
    {
        name: "International Non-Governmental Organization",
        id: "nLQuKoZXttR",
    },
    {
        name: "Ministry of Health",
        id: "DxDJklvqL7Q",
    },
    {
        name: "NGO/CBO/Academic",
        id: "MXeOmeI8Y36",
    },
    {
        name: "Civil Society Organization",
        id: "FKpadYSM48G",
    },
    {
        name: "Local Faith Based Organization",
        id: "yl4h3HuXlfE",
    },
    {
        name: "Multilateral Organization",
        id: "FBS4envxo55",
    },
    {
        name: "Community led organizations",
        id: "pZZmYvr4qBh",
    },
    {
        name: "Private Sector",
        id: "c9sd0PVzL1G",
    },
    {
        name: "Local Non-Governmental Organization",
        id: "VPLzNdhNfmj",
    },
    {
        name: "Other Organization",
        id: "bvKLmM9thFG",
    },
];

class ValidationResult {
    constructor(title, instruction, headers) {
        this.title = title;
        this.instruction = instruction;
        this.headers = headers;
        this.issues = [];
    }
}

class RequestsDuplicatedIndicators extends ValidationResult {
    constructor() {
        super(
            "Requests with duplicate indicators",
            "GF ADEx requests with the same indicator repeated in the `dx` section. Resolve the duplicates listed below.",
            [{ title: "Request" }, { title: "Duplicates" }]
        );
    }
}

class RequestsInidicatorsNotConfigured extends ValidationResult {
    constructor() {
        super(
            "Requests with indicators that are not configured",
            "GF ADEx requests that include indicators that are not configured, meaning their numerator is 0. These indicators should either configured, or removed from the request.",
            [
                { title: "Request" },
                { title: "Indicator name" },
                { title: "Indicator id" },
                { numerator: "Numerator" },
            ]
        );
    }
}

class RequestsIndicatorsNotADEX extends ValidationResult {
    constructor() {
        super(
            "Requests with other indicators",
            "GF ADEx requests with indicators that are not GF ADEx indicators (i.e. do not have [GFADEX] prefix). Only GF ADEx indicators should be included in requests.",
            [{ title: "Request" }, { title: "Indicator id" }]
        );
    }
}


var validationResults = {
    REQ_IND_DUPLICATED: new RequestsDuplicatedIndicators(),
    REQ_IND_UNCONF: new RequestsInidicatorsNotConfigured(),
    REQ_IND_NONGF: new RequestsIndicatorsNotADEX(),
    REQ_PE_MIXED: {
        title: "Requests with mixed period types",
        instruction:
            "GF ADEx requests with mixed period types, i.e. the periods specified in the 'pe' dimension do not have the same periodicity. This should be changed so that only on period type is included in each request.",
        headers: [{ title: "Request" }, { title: "Request period" }],
        issues: [],
    },
    REQ_PE_UNKNOWN: {
        title: "Requests with unsupported period types",
        instruction:
            "GF ADEx requests that include periods other than years, quarters or months, or where the period type could not be determined. Change these to one of the supported types.",
        headers: [{ title: "Request" }, { title: "Request period" }],
        issues: [],
    },
    REQ_IND_PERIOD_CONFLICT: {
        title: "Indicators in multiple requests with different period type",
        instruction:
            "GF ADEx indicators can be included in multiple requests in some cases, but only if the requests have the same period type.",
        headers: [
            { title: "Indicator name" },
            { title: "Indicator id" },
            { title: "Request" },
        ],
        issues: [],
    },
    REQ_PE_RELATIVE: {
        title: "Requests with non-relative period types",
        instruction:
            "GF ADEx requests that include periods other than relative periods. Change these to one of the supported types.",
        headers: [{ title: "Request" }, { title: "Request period" }],
        issues: [],
    },
    IND_CONF_IGNORED: {
        title: "Indicators that are configured but not in requests",
        instruction:
            "GF ADEx indicators that have been configured (numerator ≠ 0), but are not included in any GF ADEx requests.",
        headers: [{ title: "Indicator name" }, { title: "Indicator id" }],
        issues: [],
    },
    IND_DENOM_CHANGED: {
        title: "Indicators with modified denominator",
        instruction:
            "GF ADEx indicators where the denominator has been changed from '1'. This should be reviewed, as all GF ADEx indicators should be reported as numbers only.",
        headers: [
            { title: "Indicator name" },
            { title: "Indicator id" },
            { title: "Denominator" },
        ],
        issues: [],
    },
    IND_DECIMALS_CHANGED: {
        title: "Indicators with modified decimals",
        instruction:
            "GF ADEx indicators where the number of decimals has been changed from '0'. This should be reviewed, as all GF ADEx indicators should be reported as whole integers.",
        headers: [
            { title: "Indicator name" },
            { title: "Indicator id" },
            { title: "Decimals" },
        ],
        issues: [],
    },
    IND_IMPLEMENTER_TYPE: {
        title: "Indicators with incorrect attribute for implementer type",
        instruction:
            "GF ADEx indicators where the implementer type attribute is not set to a correct value. Consult the documentation for a list of possible values.",
        headers: [
            { title: "Indicator name" },
            { title: "Indicator id" },
            { title: "Implementer type" },
        ],
        issues: [],
    },
    EX_PUBLIC_SHARING: {
        title: "GF ADEX exchanges should not be publicly shared.",
        instruction: "GF ADEx exchanges should not be publicly shared.",
        headers: [{ title: "Exchange name" }],
        issues: [],
    },
    EX_USERGROUP_SHARING: {
        title: "GF ADEx exchanges should be shared with user groups.",
        instruction:
            "Provide at least one user group with access to the exchange.",
        headers: [{ title: "Exchange name" }],
        issues: [],
    },
    REQ_OUTPUT_ID_SCHEME: {
        title: "GF ADEx requests should use the correct attribute output scheme",
        instruction:
            "GF ADEx requests should use the correct attribute output scheme (\"outputIdScheme\": \"attribute:nHzX73VyNun\")",
        headers: [{ title: "Request" }, { title: "Output ID scheme" }],
        issues: [],
    },
    EX_TARGET_API: {
        title: "GF ADEx exchanges should use the correct target server.",
        instruction:
            "GF ADEx exchanges should use the correct target server: https://www.adex.theglobalfund.org",
        headers: [{ title: "Exchange name" }, { title: "Target API" }],
        issues: [],
    },
    EX_BASIC_AUTH: {
        title: "GF ADEx exchanges should not use basic authentication.",
        instruction:
            "GF ADEx exchanges should used a personal access token instead of basic authentication.",
        headers: [{ title: "Exchange name" }, { title: "Username" }],
        issues: [],
    },
    REQ_ROOT_ORGUNIT: {
        title: "GF ADEx requests should be aggregated to the level 1 organisation unit.",
        instruction:
            "Check to to be sure there is only one organisation unit defined in the ou dimension",
        headers: [{ title: "Request" }, { title: "Organisation unit" }],
        issues: [],
    },
    ORGUNIT_CODE: {
        title: "The root organisation unit should have a valid ISO3 code as the code or as an attribute",
        instruction:
            "Check to be sure that you have defined either the code or attribute for your country with the correct ISO3 code",
        headers: [
            { title: "Organisation unit" },
            { title: "Code" },
            { title: "Attribute" },
        ],
        issues: [],
    },
    EX_TARGET_OU_SCHEME: {
        title: "GF ADEx exchanges should use the correct target organisation unit scheme.",
        instruction:
            "GF ADEX exchanges should use \"CODE\" as the target organisation unit scheme.",
        headers: [{ title: "Exchange name" }, { title: "Target OU scheme" }],
        issues: [],
    },
    EX_TARGET_ID_SCHEME: {
        title: "GF ADEx exchanges should use the correct target ID scheme.",
        instruction:
            "GF ADEX exchanges should use \"UID\" as the target ID scheme.",
        headers: [{ title: "Exchange name" }, { title: "Target ID scheme" }],
        issues: [],
    },
    EX_EXIST: {
        title: "At least one GF data exchange should exist.",
        instruction:
            "At least one aggregate data exchange with a target API URL containing \"globalfund\" should exist.",
        headers: [{ title: "Exchange name" }],
        issues: [],
    },
    INDS_EXIST: {
        title: "At least one GF indicator should exist.",
        instruction:
            "If you have not already imported a GF ADEX metadata package, you should do so now.",
        headers: [{ title: "Indicator name" }],
        issues: [],
    },
    REFERENCE_METADATA: {
        title: "The GFADEX reference metadata package should be imported to the datastore.",
        instruction:
            "If you have not already imported a GFADEX metadata package, you should do so now.",
        headers: [{ title: "Message" }],
        issues: [],
    },
    IND_UNKNOWN_IN_REQUESTS: {
        title: "GFADEX requests should not include indicators that are not in the GFADEX metadata package.",
        instruction:
            "The following indicators are not in the GFADEX metadata package, but are used in GFADEx requests. Unknown GFADEX indicator should not be used in any requests made to the GFADEx API.",
        headers: [{ title: "ID" }, { title: "Indicator name" }],
        issues: [],
    },
    IND_REPORTING_COMPLETENESS: {
        title: "GFADEX reporting completeness indicators are should be present in the requests",
        instruction: "Ensure that the required reporting completeness indicators are present in the requests. This is based on a combination of the indicator group which the GFADEX indicator belongs to, and the period type of the request.",
        headers: [{ title: "Indicator ID" }, { title: "Indicator group" }, { title: "Period type" }],
        issues: []
    }
};

async function fetchExchanges() {
    const data = await d2Fetch(
        "aggregateDataExchanges.json?filter=target.api.url:like:globalfund&fields=*&paging=false"
    );
    if (!data || data.aggregateDataExchanges.length === 0) {
        console.log("No GF data exchanges found");
        return false;
    } else {
        return data.aggregateDataExchanges;
    }
}

//Get the national orgunit
async function fetchRootOrgUnit() {
    const data = await d2Fetch(
        "organisationUnits.json?filter=level:eq:1&fields=id,name,code,attributeValues[*]"
    );
    if (!data || data.organisationUnits.length === 0) {
        console.log("No root orgunit found");
        return false;
    } else {
        return data.organisationUnits[0];
    }
}

//Get the data element operands to substitute in the indicator formulas
async function fetchDataElementOperands() {
    const data = await d2Fetch(
        "dataElementOperands.json?fields=id,shortName,dimensionItem&paging=false"
    );
    if (!data || data.dataElementOperands.length === 0) {
        console.log("No data element operands could be found.");
        return false;
    } else {
        return data;
    }
}

//Get the data elements when used directly in formulas
async function fetchDataElements() {
    const data = await d2Fetch(
        "dataElements.json?fields=id,shortName&paging=false"
    );
    if (!data || data.dataElements.length === 0) {
        console.log("No data elements could be found.");
        return false;
    } else {
        return data;
    }
}

async function fetchSystemInfo() {
    const data = await d2Fetch("system/info.json");
    if (!data || data.length === 0) {
        console.log("Could not fetch system info.");
        return false;
    } else {
        return data;
    }
}

async function fetchDataSets() {
    const data = await d2Fetch("dataSets.json?fields=id,name&paging=false");
    if (!data || data.dataSets.length === 0) {
        console.log("No data sets could be found.");
        return false;
    } else {
        return data;
    }
}

//Separate configured and non-configured indicators
function indicatorsCategorize(indicators) {
    var indicatorsConf = {};
    var indicatorsUnconf = {};

    indicators.forEach((indicator) => {
        indicator.numerator.trim() == "0"
            ? (indicatorsUnconf[indicator.id] = indicator)
            : (indicatorsConf[indicator.id] = indicator);
    });

    return {
        indicatorsConf: indicatorsConf,
        indicatorsUnconf: indicatorsUnconf,
    };
}

//Get unique values from array of strings
function uniqueEntries(array) {
    return array.filter(function (el, index) {
        return index === array.indexOf(el);
    });
}

//Find any duplicate UIDs within a single request
function findDuplicatesInRequests(exchanges, validationResults) {
    for (var ex of exchanges) {
        for (var req of ex.source.requests) {
            if (req.dx.length != uniqueEntries(req.dx).length) {
                const dxs_duplicated = req.dx.filter(
                    (e, i, arr) => arr.indexOf(e) !== i
                );
                validationResults["REQ_IND_DUPLICATED"].issues.push([
                    req.name,
                    dxs_duplicated.join(", "),
                ]);
            }
        }
    }
}

//Find unconfigured indicators in requests
function findUnconfiguredInRequests(
    exchanges,
    indicatorsUnconf,
    validationResults
) {
    for (var ex of exchanges) {
        for (var req of ex.source.requests) {
            for (var ind of req.dx) {
                if (indicatorsUnconf[ind]) {
                    let numerator_preview = indicatorsUnconf[ind].numerator;
                    //Just show a few characters here if not zero to allow further investigation
                    if (numerator_preview != "0") {
                        numerator_preview =
                            numerator_preview.substring(0, 50) + "...";
                    }
                    validationResults["REQ_IND_UNCONF"].issues.push([
                        req.name,
                        indicatorsUnconf[ind].name,
                        ind,
                        numerator_preview,
                    ]);
                }
            }
        }
    }
}

//Find configured indicators NOT in requests
function findConfiguredNotInRequests(
    exchanges,
    indicatorsConf,
    validationResults
) {
    for (var confInd in indicatorsConf) {
        var found = false;
        for (var ex of exchanges) {
            for (var req of ex.source.requests) {
                if (req.dx.indexOf(confInd) !== -1) {
                    found = true;
                    break;
                }
            }

            if (found) {
                break;
            }
        }

        if (!found) {
            validationResults["IND_CONF_IGNORED"].issues.push([
                indicatorsConf[confInd].name,
                indicatorsConf[confInd].id,
            ]);
        }
    }
}

function findChangedDenominators(indicators, validationResults) {
    for (var ind of indicators) {
        if (ind.denominator.trim() != "1") {
            validationResults["IND_DENOM_CHANGED"].issues.push([
                ind.name,
                ind.id,
                ind.denominator,
            ]);
        }
    }
}

//Find non-GF indicators in request
function findNonAdexIndicatorsInRequests(
    exchanges,
    indicatorsUnconf,
    indicatorsConf,
    validationResults
) {
    for (var ex of exchanges) {
        for (var req of ex.source.requests) {
            for (var ind of req.dx) {
                if (
                    !Object.prototype.hasOwnProperty.call(
                        indicatorsUnconf,
                        ind
                    ) &&
                    !Object.prototype.hasOwnProperty.call(indicatorsConf, ind)
                ) {
                    validationResults["REQ_IND_NONGF"].issues.push([
                        req.name,
                        ind,
                    ]);
                }
            }
        }
    }
}

//Find indicators with decimals != 0
function findChangedDecimals(indicators, validationResults) {
    for (var ind of indicators) {
        if (ind.decimals != 0) {
            validationResults["IND_DECIMALS_CHANGED"].issues.push([
                ind.name,
                ind.id,
                ind.decimals,
            ]);
        }
    }
}

function findInvalidImplementerTypes(indicators, validationResults) {
    for (var ind of indicators) {
        if (
            !allowed_implementer_types.some(
                (allowed_type) =>
                    allowed_type.id === ind.aggregateExportAttributeOptionCombo
            )
        ) {
            validationResults["IND_IMPLEMENTER_TYPE"].issues.push([
                ind.name,
                ind.id,
                ind.aggregateExportAttributeOptionCombo,
            ]);
        }
    }
}

function findPublicAccess(exchanges, validationResults) {
    for (var ex of exchanges) {
        if (ex.sharing.public != "--------") {
            validationResults["EX_PUBLIC_SHARING"].issues.push([ex.name]);
        }
    }
}

//Add results to report
/* global DataTable, $ */
function printValidationResults(validationResults) {
    //Make summary
    var html = "<div id='summary_table'><h2>Summary</h2>";
    html = html + "<table id='summary' class='display' width='100%'>";
    html =
        html +
        "<thead><tr><th>Validation check</th><th>Result</th></tr></thead><tbody>";
    for (var validationType in validationResults) {
        var result = validationResults[validationType];
        html = html + "<tr><td>" + result.title + "</td>";
        if (result.issues.length === 1) {
            html = html + "<td>" + result.issues.length + " issue</td></tr>";
        } else if (result.issues.length > 1) {
            html = html + "<td>" + result.issues.length + " issues</td></tr>";
        } else {
            html = html + "<td>OK</td></tr>";
        }
    }

    html = html + "</tbody></table></div>";
    $("#validation-result").append(html);
    new DataTable("#summary", {
        paging: false,
        searching: false,
        order: [[1, "asc"]],
    });

    //Make detailed tables, only if there are violations
    for (validationType in validationResults) {
        result = validationResults[validationType];
        if (result.issues.length > 0) {
            html = "<h2>" + result.title + "</h2>";
            html = html + "<p>" + result.instruction + "</p>";
            html =
                html +
                "<table id='" +
                validationType +
                "' class='display' width='100%'></table>";
            $("#validation-result").append(html);

            new DataTable("#" + validationType, {
                columns: result.headers,
                data: result.issues,
            });
        }
    }

    //Make the #validation result div scrollable
    $("#validation-result").css("overflow", "visible");
    $("#validation-result").css("overflow-y", "auto");
    $("#validation-result").css("height", "90%");
}

const relativeQuarters = [
    "THIS_QUARTER",
    "LAST_QUARTER",
    "QUARTERS_THIS_YEAR",
    "QUARTERS_LAST_YEAR",
    "LAST_4_QUARTERS",
];
const relativeMonths = [
    "THIS_MONTH",
    "LAST_MONTH",
    "MONTHS_THIS_YEAR",
    "MONTHS_LAST_YEAR",
    "LAST_12_MONTHS",
];
const relativeYears = ["LAST_YEAR", "THIS_YEAR"];

const relativePeriodTypes = {
    MONTHLY: relativeMonths,
    QUARTERLY: relativeQuarters,
    YEARLY: relativeYears,
};

const fixedMonths = /^20[2-3][0-9][0-1][0-9]$/;
const fixedQuarters = /^202[0-9]Q[1-4]/;
const fixedYears = /^202[0-9]$/;

const fixedPeriodTypes = {
    MONTHLY: fixedMonths,
    QUARTERLY: fixedQuarters,
    YEARLY: fixedYears,
};

function classifyPeriod(period) {
    for (const [type, values] of Object.entries(relativePeriodTypes)) {
        if (values.includes(period)) {
            return { RELATIVE: type };
        }
    }

    for (const [type_fixed, regex] of Object.entries(fixedPeriodTypes)) {
        if (regex.test(period)) {
            return { FIXED: type_fixed };
        }
    }
    return { UNKNOWN: "UNKNOWN" }; // If no match is found
}

function getIndicatorAttributeFromID(id, attribute, indicators) {
    for (var ind of indicators) {
        if (ind.id === id) return ind[attribute];
    }
    return "UNKNOWN";
}

function classifyPeriods(periods) {
    const periodTypes = periods.map((period) => classifyPeriod(period));
    const uniquePeriodTypes = [
        ...new Set(
            periodTypes.map((periodType) => Object.values(periodType)[0])
        ),
    ];
    //Unknown takes precedence
    if (uniquePeriodTypes.some((periodType) => periodType === "UNKNOWN")) {
        return "UNKNOWN";
    }
    //Otherwise, if there are multiple types, it's mixed
    if (uniquePeriodTypes.length > 1) {
        return "MIXED";
    }
    //Otherwise, it's the only type
    return uniquePeriodTypes[0];
}

function requestsWithIndicator(indicatorId, exchanges) {
    var requests = [];
    for (var ex of exchanges) {
        for (var req of ex.source.requests) {
            if ($.inArray(indicatorId, req.dx) >= 0) requests.push(req.name);
        }
    }
    return requests;
}

//Separate request dx by periodicity
function findRequestPeriodInoncistenies(
    exchanges,
    indicators,
    indicatorpTypes,
    validationResults
) {
    /* Loop over all requests and
    1) look for period issues within requests
    2) categories indicators by periodtype */

    for (var ex of exchanges) {
        for (var req of ex.source.requests) {
            const periodType = classifyPeriods(req.pe);
            if (periodType === "UNKNOWN") {
                validationResults["REQ_PE_UNKNOWN"].issues.push([
                    req.name,
                    req.pe.join(","),
                ]);
            } else if (periodType === "MIXED") {
                validationResults["REQ_PE_MIXED"].issues.push([
                    req.name,
                    req.pe.join(","),
                ]);
            } else {
                indicatorpTypes[periodType] = indicatorpTypes[
                    periodType
                ].concat(req.dx);
            }
        }
    }

    //When we have indicators categorized by periodType, we can look for IDs appearing in multiple
    var allPtypes = ["MONTHLY", "QUARTERLY", "YEARLY"];
    for (var i = 0; i < allPtypes.length - 1; i++) {
        for (var ind of indicatorpTypes[allPtypes[i]]) {
            for (var j = i + 1; j < allPtypes.length; j++) {
                for (var otherInd of indicatorpTypes[allPtypes[j]]) {
                    if (ind === otherInd) {
                        validationResults[
                            "REQ_IND_PERIOD_CONFLICT"
                        ].issues.push([
                            getIndicatorAttributeFromID(
                                ind,
                                "name",
                                indicators
                            ),
                            ind,
                            requestsWithIndicator(ind, exchanges).join(", "),
                        ]);
                    }
                }
            }
        }
    }
}

function findNonRelativePeriods(exchanges, validationResults) {
    const relative_period_types = relativeQuarters.concat(
        relativeMonths,
        relativeYears
    );
    for (var ex of exchanges) {
        for (var req of ex.source.requests) {
            if (req.pe.some((pe) => !relative_period_types.includes(pe))) {
                validationResults["REQ_PE_RELATIVE"].issues.push([
                    req.name,
                    req.pe.join(","),
                ]);
            }
        }
    }
}

function findUserGroupAccess(exchanges, validationResults) {
    for (var ex of exchanges) {
        if (
            ex.userGroupAccesses?.length == undefined ||
            ex.userGroupAccesses?.length == 0
        ) {
            validationResults["EX_USERGROUP_SHARING"].issues.push([ex.name]);
        }
    }
}

function findWrongOutputIDScheme(exchanges, validationResults) {
    for (var ex of exchanges) {
        for (var req of ex.source.requests) {
            if (req.outputIdScheme != "attribute:nHzX73VyNun") {
                validationResults["REQ_OUTPUT_ID_SCHEME"].issues.push([
                    req.name,
                    req.outputIdScheme,
                ]);
            }
        }
    }
}

function findTargetAPI(exchanges, validationResults) {
    for (var ex of exchanges) {
        if (ex.target.api.url != "https://adex.theglobalfund.org/") {
            validationResults["EX_TARGET_API"].issues.push([
                ex.name,
                ex.target.api.url,
            ]);
        }
    }
}

function findBasicAuth(exchanges, validationResults) {
    for (var ex of exchanges) {
        if (Object.prototype.hasOwnProperty.call(ex.target.api, "username")) {
            validationResults["EX_BASIC_AUTH"].issues.push([
                ex.name,
                ex.target.api.username,
            ]);
        }
    }
}

function validateRootOrgUnit(root_orgunit, exchanges, validationResults) {
    const root_orgunit_uid = root_orgunit.id;
    for (var ex of exchanges) {
        for (var req of ex.source.requests) {
            if (req.ou != root_orgunit_uid || req.ou.length != 1) {
                validationResults["REQ_ROOT_ORGUNIT"].issues.push([
                    req.name,
                    req.ou,
                ]);
            }
        }
    }
}

function validateOrgUnitCode(root_orgunit, validationResults) {
    const attributeValue = root_orgunit.attributeValues.find(
        (attributeValue) => attributeValue.attribute.id === "hpe7LiGDgvo"
    );
    //These could be undefined
    var ou_is_configured =
        iso3_codes.includes(root_orgunit?.code) ||
        iso3_codes.includes(attributeValue?.value);
    //If neither is defined, ou_is_configured is false
    if (typeof ou_is_configured === "undefined") {
        ou_is_configured = false;
    }

    var orgunitCode = "";
    var attributeValueCode = "";

    if (typeof root_orgunit?.code === "undefined") {
        orgunitCode = "UNKNOWN";
    } else {
        orgunitCode = root_orgunit.code;
    }

    if (typeof attributeValue?.value === "undefined") {
        attributeValueCode = "UNKNOWN";
    } else {
        attributeValueCode = attributeValue.value;
    }

    if (!ou_is_configured) {
        validationResults["ORGUNIT_CODE"].issues.push([
            root_orgunit.name,
            orgunitCode,
            attributeValueCode,
        ]);
    }
}

function validateExchangeTargetOuScheme(exchanges, validationResults) {
    for (var ex of exchanges) {
        const targetOuScheme = ex.target.request.orgUnitIdScheme ?? "UNKNOWN";
        if (targetOuScheme != "CODE") {
            validationResults["EX_TARGET_OU_SCHEME"].issues.push([
                ex.name,
                targetOuScheme,
            ]);
        }
    }
}

function validateReferenceMetadata(metadataPackage) {
    const requiredKeys = [
        "package",
        "attributes",
        "indicators",
        "userGroups",
        "indicatorTypes",
        "indicatorGroups",
    ];
    const missingKeys = requiredKeys.filter(
        (key) => !Object.keys(metadataPackage).includes(key)
    );

    if (missingKeys.length > 0) {
        validationResults["REFERENCE_METADATA"].issues.push([
            "The metadata package is missing the following keys: " +
            missingKeys.join(", "),
        ]);
    }

    if (metadataPackage?.package != undefined) {
        const pacakgeMetadata = metadataPackage?.package[0];
        //Check that the version is follows a semver pattern
        const packageVersion = pacakgeMetadata?.version;
        const semverPattern = /^\d+\.\d+\.\d+$/;
        if (!semverPattern.test(packageVersion)) {
            validationResults["REFERENCE_METADATA"].issues.push([
                "The GFADEX metadata package versions is not valid: " +
                packageVersion,
            ]);
        }

        //Check that the package origin is globalfund.org
        const packageOriginPattern = /globalfund\.org$/;
        const packageOrigin = pacakgeMetadata?.origin;
        if (!packageOriginPattern.test(packageOrigin)) {
            validationResults["REFERENCE_METADATA"].issues.push([
                "The GFADEX metadata package origin is not valid: " +
                packageOrigin,
            ]);
        }
    }
}


const reporting_completeness_indicators = [
    {
        periodType: "YEARLY",
        indicatorGroupID: "oMs1GuFtenV",
        indicatorGroup: "HIV Treatment",
        indicators: ["hfdKm6YcxAB", "fshnoK20gRZ"]
    },
    {
        periodType: "YEARLY",
        indicatorGroupID: "tJOYEy7udhU",
        indicatorGroup: "TB",
        indicators: ["eb6oUB8VkEN", "asYwCpEumkz"]
    },
    {
        periodType: "YEARLY",
        indicatorGroupID: "otHPc2RKlzp",
        indicatorGroup: "Malaria",
        indicators: ["k7UlcefiknR", "ii5C6GtqWDY"]
    },
    {
        periodType: "YEARLY",
        indicatorGroupID: "njq1rdVJ9CT",
        indicatorGroup: "HIV/KP Prev",
        indicators: ["hfeUAMRW9KV", "f7SRpiJuHt5"]
    },
    {
        periodType: "YEARLY",
        indicatorGroupID: "nEUKFHJYD4Z",
        indicatorGroup: "RSSH",
        indicators: ["h48D5HWaFJE", "sp1uDWVLIlG"]
    },
    {
        periodType: "YEARLY",
        indicatorGroupID: "dU6JGugp9Hd",
        indicatorGroup: "C19",
        indicators: ["envPbmZWHQL", "jAHU3YfadGl"]
    },
    {
        periodType: "QUARTERLY",
        indicatorGroupID: "oMs1GuFtenV",
        indicatorGroup: "HIV Treatment",
        indicators: ["jRT4WhtHNm8", "jFpSI9i6TdC"]
    },
    {
        periodType: "QUARTERLY",
        indicatorGroupID: "tJOYEy7udhU",
        indicatorGroup: "TB",
        indicators: ["ty4Rs2ufFkT", "deH25n7UpM6"]
    },
    {
        periodType: "QUARTERLY",
        indicatorGroupID: "otHPc2RKlzp",
        indicatorGroup: "Malaria",
        indicators: ["zWxpGAeEDbu", "diWJNh7UtAz"]
    },
    {
        periodType: "QUARTERLY",
        indicatorGroupID: "njq1rdVJ9CT",
        indicatorGroup: "HIV/KP Prev",
        indicators: ["v5iMp1k4hOj", "tfoxS5qLRTg"]
    },
    {
        periodType: "QUARTERLY",
        indicatorGroupID: "nEUKFHJYD4Z",
        indicatorGroup: "RSSH",
        indicators: ["e4a2jtcNInk", "zOolpUFydnK"]
    },
    {
        periodType: "QUARTERLY",
        indicatorGroupID: "dU6JGugp9Hd",
        indicatorGroup: "C19",
        indicators: ["vSp5N7Cl0cm", "mDLqxunbIGo"]
    },
    {
        periodType: "MONTHLY",
        indicatorGroupID: "oMs1GuFtenV",
        indicatorGroup: "HIV Treatment",
        indicators: ["lVHP61GmFDI", "z2SE54isZTl"]
    },
    {
        periodType: "MONTHLY",
        indicatorGroupID: "tJOYEy7udhU",
        indicatorGroup: "TB",
        indicators: ["rp3aMN1rSkE", "xLlWiUY4xkr"]
    },
    {
        periodType: "MONTHLY",
        indicatorGroupID: "otHPc2RKlzp",
        indicatorGroup: "Malaria",
        indicators: ["cv5A8gmoZCW", "yJNSpostucx"]
    },
    {
        periodType: "MONTHLY",
        indicatorGroupID: "njq1rdVJ9CT",
        indicatorGroup: "HIV/KP Prev",
        indicators: ["ymHq2DuxQb3", "jDEhLHWwlpM"]
    }
];

function getIndicatorGroupForIndicator(indicatorId, indicatorGroupMap) {
    for (var indGroup of indicatorGroupMap) {
        if (indGroup.indicatorID === indicatorId) {
            return indGroup.indicatorGroupID;
        }
    }
    return "UNKNOWN";
}

function getIndicatorNameForIndicator(indicatorId, metadataPackage) {
    for (var ind of metadataPackage.indicators) {
        if (ind.id === indicatorId) {
            return ind.name;
        }
    }
    return "UNKNOWN";

}

function createIndicatorGroupMap(metadataPackage) {
    //Create a map of indicator groups to indicators
    var indicatorGroupMap = [];
    metadataPackage.indicatorGroups.forEach((indicatorGroup) => {
        indicatorGroup.indicators.forEach((indicator) => {
            indicatorGroupMap.push({
                indicatorGroupID: indicatorGroup.id,
                indicatorID: indicator.id,
                indicatorName: indicator.name,
            });
        });
    });
    return indicatorGroupMap;
}


function getUniquePeriodTypesIndicatorGroupMap(exchanges, indicatorGroupMap) {
    var periodTypesIndicatorGroupMap = [];
    if (exchanges.length === 0) return [];

    for (var ex of exchanges) {
        for (var req of ex.source.requests) {
            for (var ind of req.dx) {
                const periodType = classifyPeriods(req.pe);
                const indicatorGroupID = getIndicatorGroupForIndicator(ind, indicatorGroupMap);
                periodTypesIndicatorGroupMap.push({
                    indicatorGroupID: indicatorGroupID,
                    periodType: periodType
                });
            }
        }
    }

    // Remove the duplicated indicator groups/period types
    const uniquePeriodTypesIndicatorGroupMap = periodTypesIndicatorGroupMap.filter(
        (periodTypeIndicatorGroup, index, self) =>
            index === self.findIndex((t) => (
                t.indicatorGroupID === periodTypeIndicatorGroup.indicatorGroupID && t.periodType === periodTypeIndicatorGroup.periodType
            ))
    );

    return uniquePeriodTypesIndicatorGroupMap;
}

function validateReportingCompleteness(metadataPackage, exchanges) {


    
    //Create a map of indicator groups to indicators
    var indicatorGroupMap = createIndicatorGroupMap(metadataPackage);
    var uniquePeriodTypesIndicatorGroupMap = getUniquePeriodTypesIndicatorGroupMap(exchanges, indicatorGroupMap);

    //Find the indicator groups and period types
    //which are present in the uniquePeriodTypesIndicatorGroupMap
    const reportingCompletenessIndicators = reporting_completeness_indicators.filter(
        (reportingCompletenessIndicator) =>
            uniquePeriodTypesIndicatorGroupMap.some(
                (uniquePeriodTypeIndicatorGroup) =>
                    uniquePeriodTypeIndicatorGroup.indicatorGroupID ===
                    reportingCompletenessIndicator.indicatorGroupID &&
                    uniquePeriodTypeIndicatorGroup.periodType ===
                    reportingCompletenessIndicator.periodType
            )
    );
    //Extract out the unique set of indicatorIDs from reportingCompletenessIndicators
    const reportingCompletenessIndicatorIDs = reportingCompletenessIndicators.map(
        (reportingCompletenessIndicator) =>
            reportingCompletenessIndicator.indicators
    ).flat();

    //Check that all indicators in reportingCompletenessIndicatorIDs are present in the exchanges
    const missingIndicators = reportingCompletenessIndicatorIDs.filter(
        (indicatorID) =>
            !exchanges.some((ex) =>
                ex.source.requests.some((req) => req.dx.includes(indicatorID))
            )
    );
    //reduce the missing indicators to a unique set
    const missingIndicatorsSet = new Set(missingIndicators);
    console.log(missingIndicatorsSet);

    if (missingIndicators.length > 0) {

        missingIndicators.forEach((missingIndicator) => {
            const missingReportingCompletenessIndicator =  reporting_completeness_indicators.find(
                (reportingCompletenessIndicator) =>
                    reportingCompletenessIndicator.indicators.includes(missingIndicator)
            );

            const missingIndicatorName = getIndicatorNameForIndicator(missingIndicator, metadataPackage);

            validationResults["IND_REPORTING_COMPLETENESS"].issues.push([
                missingIndicatorName,
                missingReportingCompletenessIndicator.indicatorGroup,
                missingReportingCompletenessIndicator.periodType
            ]);
        });
    }
}

function checkTargetOutputIdScheme(exchanges, validationResults) {
    for (var ex of exchanges) {
        if (ex.target.request.idScheme != "UID") {
            validationResults["EX_TARGET_ID_SCHEME"].issues.push([
                ex.name,
                ex.target.request.idScheme,
            ]);
        }
    }
}

function addFooters(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
            "Page " + String(i) + " of " + String(pageCount),
            doc.internal.pageSize.width / 2,
            287,
            {
                align: "center",
            }
        );
    }
}

function identifyUnknownIndicatorsInRequests(
    exchanges,
    indicators,
    metadataPackage
) {
    //If there is no metadata package, we can't do this
    if (metadataPackage.indicators == undefined) {
        return;
    }

    const knownIndicators = metadataPackage.indicators.map(
        (indicator) => indicator.id
    );
    const unknownIndicators = [];

    for (var ex of exchanges) {
        for (var req of ex.source.requests) {
            for (var ind of req.dx) {
                if (!knownIndicators.includes(ind)) {
                    unknownIndicators.push(ind);
                }
            }
        }
    }
    //Filter local GFADEx indicators which have been used in requests but which are not part of the GFADEX metadata package
    const unknownIndicatorsInReqests = indicators.filter((indicator) =>
        unknownIndicators.includes(indicator.id)
    );

    if (unknownIndicatorsInReqests.length > 0) {
        validationResults["IND_UNKNOWN_IN_REQUESTS"].issues =
            unknownIndicatorsInReqests.map((indicator) => [
                indicator.id,
                indicator.name,
            ]);
    }
}

export function reportToPDF() {
    const { jsPDF } = window.jspdf;
    var doc = new jsPDF("portrait");
    const current_time = new Date().toJSON();
    doc.text("ADEX Validation Report", 20, 20);
    doc.text("Hostname: " + systemInfo.contextPath, 20, 30);
    doc.text("DHIS2 Version: " + systemInfo.version, 20, 40);
    doc.text("Revision:" + systemInfo.revision, 20, 50);
    doc.text("Generated on: " + current_time, 20, 60);
    doc.addPage();
    doc.page = 1;
    for (var validationType in validationResults) {
        var result = validationResults[validationType];
        if (result.issues.length > 0) {
            doc.text(result.title, 10, 10);
            doc.autoTable({
                head: [result.headers.map((header) => header.title)],
                body: result.issues,
                startY: 30,
            });
            doc.addPage();
        }
    }
    addFooters(doc);
    doc.save("gf_adex_validation.pdf");
}

function indicatorNumeratorExpressionDescription(id) {
    for (var ind of updatedIndicators) {
        if (ind.id === id) return ind.numerator;
    }
    return "UNKNOWN";
}

export function configToCSV() {
    var csv_data = [];
    csv_data.push(
        "\"UID\",\"Code\",\"Short Name\",\"Indicator name\",\"Period type\",\"Numerator\""
    );
    for (var pType in indicatorpTypes) {
        for (var indicator in indicatorpTypes[pType]) {
            let csvrow = [];
            let indicatorId = indicatorpTypes[pType][indicator];
            csvrow.push("\"" + indicatorId + "\"");
            csvrow.push(
                "\"" +
                getIndicatorAttributeFromID(
                    indicatorId,
                    "code",
                    indicators
                ) +
                "\""
            );
            csvrow.push(
                "\"" +
                getIndicatorAttributeFromID(
                    indicatorId,
                    "shortName",
                    indicators
                ) +
                "\""
            );
            csvrow.push(
                "\"" +
                getIndicatorAttributeFromID(
                    indicatorId,
                    "name",
                    indicators
                ) +
                "\""
            );
            csvrow.push("\"" + pType + "\"");
            csvrow.push(
                "\"" + indicatorNumeratorExpressionDescription(indicatorId) + "\""
            );
            csv_data.push(csvrow.join(","));
        }
    }
    csv_data = csv_data.join("\n");
    downloadCSVFile(csv_data);
}

function downloadCSVFile(csv_data) {
    var CSVFile = new Blob([csv_data], {
        type: "text/csv",
    });
    var temp_link = document.createElement("a");
    temp_link.download = "gf_indicator_config.csv";
    var url = window.URL.createObjectURL(CSVFile);
    temp_link.href = url;
    temp_link.style.display = "none";
    document.body.appendChild(temp_link);
    temp_link.click();
    document.body.removeChild(temp_link);
}

function replaceFormulasWithShortNames(
    indicators,
    operands,
    dataElements,
    dataSets
) {
    const totalsMap = {};

    dataElements.dataElements.forEach((dataElement) => {
        totalsMap[dataElement.id] = dataElement.shortName;
    });

    const detailsMap = {};
    operands.dataElementOperands.forEach((operand) => {
        detailsMap[operand.dimensionItem] = operand.shortName;
    });

    const dataSetMap = {};
    dataSets.dataSets.forEach((dataSet) => {
        dataSetMap[dataSet.id] = dataSet.name;
    });

    indicators.forEach((indicator) => {
        if (indicator.numerator) {
            indicator.numerator = indicator.numerator.replace(
                /(\w+\.\w+)/g,
                (match) => {
                    return detailsMap[match] || match;
                }
            );
            indicator.numerator = indicator.numerator.replace(
                /(\w+)/g,
                (match) => {
                    return totalsMap[match] || match;
                }
            );

            indicator.numerator = indicator.numerator.replace(
                /(\w+)/g,
                (match) => {
                    return dataSetMap[match] || match;
                }
            );
        }

        if (indicator.denominator) {
            indicator.denominator = indicator.denominator.replace(
                /(\w+\.\w+)/g,
                (match) => {
                    return detailsMap[match] || match;
                }
            );
            indicator.denominator = indicator.denominator.replace(
                /(\w+)/g,
                (match) => {
                    return totalsMap[match] || match;
                }
            );

            indicator.denominator = indicator.denominator.replace(
                /(\w+)/g,
                (match) => {
                    return dataSetMap[match] || match;
                }
            );
        }
    });

    return indicators;
}

export async function runValidation() {
    //TODO: Fix this
    $("#validation-result").empty();
    $("#loading").show();
    console.log("Starting validation");

    //Get the stuff to validate
    systemInfo = await fetchSystemInfo();
    indicators = await fetchIndicators();
    exchanges = await fetchExchanges();
    root_orgunit = await fetchRootOrgUnit();
    operands = await fetchDataElementOperands();
    dataElements = await fetchDataElements();
    dataSets = await fetchDataSets();
    metadataPackage = await fetchIndicatorsFromDataStore();

    Promise.all([
        systemInfo,
        exchanges,
        root_orgunit,
        indicators,
        operands,
        dataElements,
        dataSets,
        metadataPackage,
    ])
        .then(console.log("Fetched metadata."))
        .catch((err) => {
            console.log(err);
            return false;
        });

    updatedIndicators = replaceFormulasWithShortNames(
        indicators,
        operands,
        dataElements,
        dataSets
    );

    //Categorize the indicators
    const classifiedIndicators = indicatorsCategorize(indicators);
    indicatorsConf = classifiedIndicators.indicatorsConf;
    indicatorsUnconf = classifiedIndicators.indicatorsUnconf;

    //Empty all of the "issues": [] arrays prior to a new validation run
    for (var validationType in validationResults) {
        validationResults[validationType].issues = [];
    }

    //If we do not have any exchanges, then we cannot check these
    if (exchanges.length > 0) {
        findDuplicatesInRequests(exchanges, validationResults);
        findUnconfiguredInRequests(
            exchanges,
            indicatorsUnconf,
            validationResults
        );
        findConfiguredNotInRequests(
            exchanges,
            indicatorsConf,
            validationResults
        );
        findNonAdexIndicatorsInRequests(
            exchanges,
            indicatorsUnconf,
            indicatorsConf,
            validationResults
        );
        findPublicAccess(exchanges, validationResults);
        findUserGroupAccess(exchanges, validationResults);
        findRequestPeriodInoncistenies(
            exchanges,
            indicators,
            indicatorpTypes,
            validationResults
        );
        findNonRelativePeriods(exchanges, validationResults);
        findWrongOutputIDScheme(exchanges, validationResults);
        findTargetAPI(exchanges, validationResults);
        findBasicAuth(exchanges, validationResults);
        validateRootOrgUnit(root_orgunit, exchanges, validationResults);
        validateExchangeTargetOuScheme(exchanges, validationResults);
        checkTargetOutputIdScheme(exchanges, validationResults);
        identifyUnknownIndicatorsInRequests(
            exchanges,
            indicators,
            metadataPackage
        );
    } else {
        validationResults["EX_EXIST"].issues.push(["No exchanges found"]);
    }

    if (indicators.length > 0) {
        findChangedDenominators(indicators, validationResults);
        findChangedDecimals(indicators, validationResults);
        findInvalidImplementerTypes(indicators, validationResults);
    } else {
        validationResults["INDS_EXIST"].issues.push([
            "No GF ADEX indicators found",
        ]);
    }

    validateReportingCompleteness(metadataPackage, exchanges);
    validateOrgUnitCode(root_orgunit, validationResults);
    validateReferenceMetadata(metadataPackage);

    $("#loading").hide();
    $("#download-summary-csv").prop("disabled", false);
    $("#download-report-pdf").prop("disabled", false);
    printValidationResults(validationResults);
}

export class ValidationReport extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <h2 data-i18n="validation-report.title"></h2>
            <table id="downloads">
            <tr>
                <td>
                    <button id="run-validation" onclick="runValidation()" data-i18n="validation-report.run-validation-btn"></button>
                </td>
                <td>
                    <button id="download-summary-csv" type="button" onclick="configToCSV()" disabled="disabled" data-i18n="validation-report.download-summary-btn">
                        Download Exchange Summary
                    </button>
                </td>
                <td>
                    <button id="download-report-pdf" type="button" onclick="reportToPDF()" disabled="disabled" data-i18n="validation-report.download-report-btn">
                        Download Report (PDF)
                    </button>
                </td>
            </tr>
           </table>
           <div id="loading" style="display:none" >
           <h1 data-i18n="loading">Loading...please wait.</h1>
           <img alt=""
               src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHdpZHRoPSI0MHB4IiBoZWlnaHQ9IjQwcHgiIHZpZXdCb3g9IjAgMCA0MCA0MCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEuNDE0MjE7IiB4PSIwcHgiIHk9IjBweCI+CiAgICA8ZGVmcz4KICAgICAgICA8c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwhW0NEQVRBWwogICAgICAgICAgICBALXdlYmtpdC1rZXlmcmFtZXMgc3BpbiB7CiAgICAgICAgICAgICAgZnJvbSB7CiAgICAgICAgICAgICAgICAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDBkZWcpCiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIHRvIHsKICAgICAgICAgICAgICAgIC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoLTM1OWRlZykKICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICAgICAgQGtleWZyYW1lcyBzcGluIHsKICAgICAgICAgICAgICBmcm9tIHsKICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpCiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIHRvIHsKICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKC0zNTlkZWcpCiAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgICAgIHN2ZyB7CiAgICAgICAgICAgICAgICAtd2Via2l0LXRyYW5zZm9ybS1vcmlnaW46IDUwJSA1MCU7CiAgICAgICAgICAgICAgICAtd2Via2l0LWFuaW1hdGlvbjogc3BpbiAxLjVzIGxpbmVhciBpbmZpbml0ZTsKICAgICAgICAgICAgICAgIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuOwogICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBzcGluIDEuNXMgbGluZWFyIGluZmluaXRlOwogICAgICAgICAgICB9CiAgICAgICAgXV0+PC9zdHlsZT4KICAgIDwvZGVmcz4KICAgIDxnIGlkPSJvdXRlciI+CiAgICAgICAgPGc+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMCwwQzIyLjIwNTgsMCAyMy45OTM5LDEuNzg4MTMgMjMuOTkzOSwzLjk5MzlDMjMuOTkzOSw2LjE5OTY4IDIyLjIwNTgsNy45ODc4MSAyMCw3Ljk4NzgxQzE3Ljc5NDIsNy45ODc4MSAxNi4wMDYxLDYuMTk5NjggMTYuMDA2MSwzLjk5MzlDMTYuMDA2MSwxLjc4ODEzIDE3Ljc5NDIsMCAyMCwwWiIgc3R5bGU9ImZpbGw6YmxhY2s7Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxnPgogICAgICAgICAgICA8cGF0aCBkPSJNNS44NTc4Niw1Ljg1Nzg2QzcuNDE3NTgsNC4yOTgxNSA5Ljk0NjM4LDQuMjk4MTUgMTEuNTA2MSw1Ljg1Nzg2QzEzLjA2NTgsNy40MTc1OCAxMy4wNjU4LDkuOTQ2MzggMTEuNTA2MSwxMS41MDYxQzkuOTQ2MzgsMTMuMDY1OCA3LjQxNzU4LDEzLjA2NTggNS44NTc4NiwxMS41MDYxQzQuMjk4MTUsOS45NDYzOCA0LjI5ODE1LDcuNDE3NTggNS44NTc4Niw1Ljg1Nzg2WiIgc3R5bGU9ImZpbGw6cmdiKDIxMCwyMTAsMjEwKTsiLz4KICAgICAgICA8L2c+CiAgICAgICAgPGc+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMCwzMi4wMTIyQzIyLjIwNTgsMzIuMDEyMiAyMy45OTM5LDMzLjgwMDMgMjMuOTkzOSwzNi4wMDYxQzIzLjk5MzksMzguMjExOSAyMi4yMDU4LDQwIDIwLDQwQzE3Ljc5NDIsNDAgMTYuMDA2MSwzOC4yMTE5IDE2LjAwNjEsMzYuMDA2MUMxNi4wMDYxLDMzLjgwMDMgMTcuNzk0MiwzMi4wMTIyIDIwLDMyLjAxMjJaIiBzdHlsZT0iZmlsbDpyZ2IoMTMwLDEzMCwxMzApOyIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgICAgPHBhdGggZD0iTTI4LjQ5MzksMjguNDkzOUMzMC4wNTM2LDI2LjkzNDIgMzIuNTgyNCwyNi45MzQyIDM0LjE0MjEsMjguNDkzOUMzNS43MDE5LDMwLjA1MzYgMzUuNzAxOSwzMi41ODI0IDM0LjE0MjEsMzQuMTQyMUMzMi41ODI0LDM1LjcwMTkgMzAuMDUzNiwzNS43MDE5IDI4LjQ5MzksMzQuMTQyMUMyNi45MzQyLDMyLjU4MjQgMjYuOTM0MiwzMC4wNTM2IDI4LjQ5MzksMjguNDkzOVoiIHN0eWxlPSJmaWxsOnJnYigxMDEsMTAxLDEwMSk7Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxnPgogICAgICAgICAgICA8cGF0aCBkPSJNMy45OTM5LDE2LjAwNjFDNi4xOTk2OCwxNi4wMDYxIDcuOTg3ODEsMTcuNzk0MiA3Ljk4NzgxLDIwQzcuOTg3ODEsMjIuMjA1OCA2LjE5OTY4LDIzLjk5MzkgMy45OTM5LDIzLjk5MzlDMS43ODgxMywyMy45OTM5IDAsMjIuMjA1OCAwLDIwQzAsMTcuNzk0MiAxLjc4ODEzLDE2LjAwNjEgMy45OTM5LDE2LjAwNjFaIiBzdHlsZT0iZmlsbDpyZ2IoMTg3LDE4NywxODcpOyIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgICAgPHBhdGggZD0iTTUuODU3ODYsMjguNDkzOUM3LjQxNzU4LDI2LjkzNDIgOS45NDYzOCwyNi45MzQyIDExLjUwNjEsMjguNDkzOUMxMy4wNjU4LDMwLjA1MzYgMTMuMDY1OCwzMi41ODI0IDExLjUwNjEsMzQuMTQyMUM5Ljk0NjM4LDM1LjcwMTkgNy40MTc1OCwzNS43MDE5IDUuODU3ODYsMzQuMTQyMUM0LjI5ODE1LDMyLjU4MjQgNC4yOTgxNSwzMC4wNTM2IDUuODU3ODYsMjguNDkzOVoiIHN0eWxlPSJmaWxsOnJnYigxNjQsMTY0LDE2NCk7Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxnPgogICAgICAgICAgICA8cGF0aCBkPSJNMzYuMDA2MSwxNi4wMDYxQzM4LjIxMTksMTYuMDA2MSA0MCwxNy43OTQyIDQwLDIwQzQwLDIyLjIwNTggMzguMjExOSwyMy45OTM5IDM2LjAwNjEsMjMuOTkzOUMzMy44MDAzLDIzLjk5MzkgMzIuMDEyMiwyMi4yMDU4IDMyLjAxMjIsMjBDMzIuMDEyMiwxNy43OTQyIDMzLjgwMDMsMTYuMDA2MSAzNi4wMDYxLDE2LjAwNjFaIiBzdHlsZT0iZmlsbDpyZ2IoNzQsNzQsNzQpOyIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgICAgPHBhdGggZD0iTTI4LjQ5MzksNS44NTc4NkMzMC4wNTM2LDQuMjk4MTUgMzIuNTgyNCw0LjI5ODE1IDM0LjE0MjEsNS44NTc4NkMzNS43MDE5LDcuNDE3NTggMzUuNzAxOSw5Ljk0NjM4IDM0LjE0MjEsMTEuNTA2MUMzMi41ODI0LDEzLjA2NTggMzAuMDUzNiwxMy4wNjU4IDI4LjQ5MzksMTEuNTA2MUMyNi45MzQyLDkuOTQ2MzggMjYuOTM0Miw3LjQxNzU4IDI4LjQ5MzksNS44NTc4NloiIHN0eWxlPSJmaWxsOnJnYig1MCw1MCw1MCk7Ii8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4K" />
           </div>
            <div id="validation-result" width="100%"></div>
            `;
    }
}
