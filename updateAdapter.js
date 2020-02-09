let request = require("request");
const config = require("./config");
const { baseUrl, orgId, authToken, exportAdapterId } = config;

function updateAdapter (adapterProps, properties) {
    let reqData = [];

    for (let i = properties.length - 1; i >= 0; i--) {
        let property = properties[i];
        let { name, field_id } = property;

        if (adapterProps.includes(name)) {
            continue;
        }

        let adapterPropObj = {
            required: false,
            mapping_type: "SIMPLE",
            adapter_property_name: name,
            pim_property_id: field_id
        };
        reqData.push(adapterPropObj);
    }

    let reqObj = {
        network_adapter_summary: {
            property_details_with_mappings: reqData
        },
        clone_adapter: false
    }

    let adapaterReqObject = {
        method: "PATCH",
        url: `${baseUrl}api/v2/${orgId}/networks/adapters/${exportAdapterId}`,
        headers: {
            "Cache-Control": "no-cache",
            Accept: "*/*",
            Authorization: authToken,
            "Content-Type": "application/json"
        },
        body: reqObj,
        json: true
    }

    request(adapaterReqObject, function(error, response, body) {
        if (error) throw new Error(error)
        console.log(body);
    });
}

let propertiesReqObj = {
    method: "POST",
    url: `${baseUrl}/api/v1/${orgId}/properties/filters`,
    headers: {
        "cache-control": "no-cache",
        Connection: "keep-alive",
        "Accept-Encoding": "gzip, deflate",
        Accept: "*/*",
        Authorization: authToken,
        "Content-Type": "application/json"
    },
    body: {
        meta: true,
        withPermissions: false,
        page: 1,
        count: 10
    },
    json: true
};

request(propertiesReqObj, function(error, response, body) {
    if (error) throw new Error(error)
    console.log(response.statusCode);
    let properties = body.data.properties;

    console.log(properties.length);

    let adapterPropsRequest = {
        method: "POST",
        url: `${baseUrl}/paprika/api/v2/${orgId}/networkAdapters/${exportAdapterId}/propertyMappings`,
        headers: {
            "cache-control": "no-cache",
            Connection: "keep-alive",
            "Accept-Encoding": "gzip, deflate",
            Accept: "*/*",
            Authorization: authToken,
            "Content-Type": "application/json"
        },
        body: {
            page: 1,
            count: 5000
        },
        json: true
    };

    request(adapterPropsRequest, function(error, response, body) {
        let { data = {} } = body;
        let { entries = [] } = data;
        let adapterProps = entries.map(obj => obj.adapter_property_name);
        console.log(adapterProps.length);
        updateAdapter(adapterProps, properties);
    });
})