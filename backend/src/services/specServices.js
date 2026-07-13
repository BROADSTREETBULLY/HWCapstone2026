const Spec = require("../models").Spec;

//tells regex to treat special characters as literal character not instruction
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


//function to filter spec includes escape regex to ensure no issue with special characters when filtering
function filter(filterModel) {
    if (!filterModel?.items?.length) return {};
    const query = {};
    filterModel.items.forEach(({ field, value, operator }) => {
        if (!field || value == null) return;
        const safeValue = escapeRegex(String(value));
        switch (operator) {
            case "contains":
                query[field] = { $regex: safeValue, $options: "i"};
                break;
            case "equals":
                query[field] = value;
                break;
            case "startsWith":
                query[field] = { $regex: `^${safeValue}`, $options: "i" };
                break;
            case "endsWith":
                query[field] = { $regex: `${safeValue}$`, $options: "i" };
                break;
            case ">":
                query[field] = { $gt: value };
                break;
            case "<":
                query[field] = { $lt: value };
                break;
            
        }
    });
return query;
}

//function to sort spec
function sort(sortModel) {
    if (!sortModel?.length) return {};
    const sortQuery = {};
    sortModel.forEach(({ field, sort: direction }) => {
        sortQuery[field] = direction === "asc" ? 1 : -1;
    });
    return sortQuery;
}

//get Library with inbuilt pagination 

async function getLibrary({ paginationModel, filterModel, sortModel}) {
    const queryLibrary = filter(filterModel);
    const sortLibrary = sort(sortModel);
    const {page, pageSize } = paginationModel; 

    const [items, itemCount] = await Promise.all([
        Spec.find(queryLibrary).sort(sortLibrary).skip(page * pageSize).limit(pageSize),
        Spec.countDocuments(queryLibrary),
    ]);
    
    return { items, itemCount };
}

//get one spec via id

async function getOne(id) {
    const spec = await Spec.findById(id);
    if (!spec) throw new Error("Spec no found");
    return spec
}

//create a new spec 

async function createOne(data) {
    const newSpec = await Spec.create(data);
    return newSpec;
}

//update a ex spec by id

async function updateOne(id, data) {
    const updatedSpec = await Spec.findByIdAndUpdate(
        id,
        { ...data, updatedAt: Date.now() },
        { new: true }
    );
    if (!updatedSpec) throw new Error("Spec not found");
        return updatedSpec;
}

//delete ex spec by id
async function deleteOne(id) {
    const deleted = await Spec.findByIdAndDelete(id); 
    if (!deleted) throw new Error("Spec not found");
}

module.exports = { getLibrary, getOne, createOne, updateOne, deleteOne };