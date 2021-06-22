/** 
 * creates links for the admin backend 
 * @constructor
 */
function AdminLink() { }

AdminLink.prototype = {

    /** /Admin/TestEmailSent */
    testEmailSent: function() {
        return '/Admin/TestEmailSent';
    },

    /** /Admin/SendTestEmail */
    sendTestEmail: function() {
        return '/Admin/SendTestEmail';
    },

    /**
     * /Admin/DeleteModLink/{id}/{text}
     * @param {number} linkId - the ID of the link
     * @param {string} linkText - the display text of the link
     * @param {number} modId - the ID of the mod
     */
    deleteModLink: function (linkId, linkText, modId) {
        return `/Admin/DeleteModLink/${linkId.toString(10)}/${linkText}/${modId.toString(10)}`;
    },

    /**
     * /Admin/DeleteMod/{id}
     * @param {number} id - the ID of the mod
     * @param {string} name - the name of the mod
     */
    deleteMod: function (id, name) {
        return `/Admin/DeleteMod/${id.toString(10)}/${name}`;
    },


    /** /Admin/Overview */
    adminOverview: function () {
        return '/Admin/Overview';
    },


    /** /Admin/AddVideo */
    addVideos: function () {
        return '/Admin/AddVideo';
    },


    /** /Admin/CreateMod */
    createMod: function () {
        return '/Admin/CreateMod';
    },


    /**
     * /Admin/Mod/{ID}
     * @param {number} modId - the ID of the mod
     */
    mod: function (modId) {
        return `/Admin/Mod/${modId.toString(10)}`;
    },


    /**
     * /Admin/ModDeleted/{Name}
     * @param {string} modName - the name of the mod
     */
    modDeleted: function (modName) {
        return `/Admin/ModDeleted/${modName}`;
    },


    /**
     * /Admin/
     * @param {number} modId - the ID of the mod
     * @param {string} modLinkName - the name of the mod link
     */
    modLinkDeleted: function (modId, modLinkName) {
        return `/Admin/ModLinkDeleted/${modId.toString(10)}/${modLinkName}`;
    },


    /** /Admin/Mods */
    mods: function () {
        return '/Admin/Mods';
    },


    /**
     * /Admin/Resources/{type}
     * @param {number} type - the resource type as number
     */
    resourceOverview: function (type) {
        return `/Admin/Resources/${type.toString(10)}`
    },


    /**
     * /Admin/VideosSaved/{videoIds}
     * @param {string} videoIds - the video IDS concatenated as string
     */
    videosSaved: function (videoIds) {
        return `/Admin/VideosSaved/${videoIds}`;
    },


    /**
     * /Admin/CreateLink/{ModId}
     * @param {number} modId - the ID of the mod
     */
    createModLink: function (modId) {
        return `/Admin/CreateLink/${modId.toString(10)}`;
    },


    /** /Admin/CreateResource */
    createNewResource: function () {
        return '/Admin/CreateResource';
    },


    /**
     * /Admin/Resource/{ResourceId}
     * @param {string} id - the ID of the isaac resource
     */
    resourceDetails: function (id) {
        return `/Admin/Resource/${id}`;
    },


    /**
     * /Admin/ResourceDeleted/{type}/{id}
     * @param {number} type - the resource type as number
     * @param {string} id - the resource ID
     */
    resourceDeleted: function (type, id) {
        return `/Admin/ResourceDeleted/${type.toString(10)}/${id}`;
    },


    /**
     * /Admin/EditResource/{id}
     * @param {string} id -  the resource ID
     */
    editResource: function (id) {
        return `/Admin/EditResource/${id}`;
    },


    /**
     * /Admin/DeleteResource/{type}/{id}
     * @param {number} type - the resource type as number
     * @param {string} id - the resource ID
     */
    deleteResource: function (type, id) {
        return `/Admin/DeleteResource/${type.toString(10)}/${id}`;
    },


    /** /Admin/Submissions */
    submissions: function () {
        return '/Admin/Submissions';
    },


    /**
     * /Admin/EditSubmission/{videoId}/{submissionId}
     * @param {string} videoId
     * @param {number} submissionId
     */
    editSubmission: function (videoId, submissionId) {
        return `/Admin/EditSubmission/${videoId}/${submissionId.toString(10)}`;
    },


    /**
     * /Admin/EditGameplayEvent/{eventId}/{videoId}/{submissionId}
     * @param {number} eventId
     * @param {string} videoId
     * @param {number} submissionId
     */
    editGameplayEvent: function (eventId, videoId, submissionId) {
        return `/Admin/EditGameplayEvent/${eventId.toString(10)}/${videoId}/${submissionId.toString(10)}`;
    },


    /**
     * /Admin/InsertGameplayEvent/{videoId}/{submissionId}/{insertAfterEventId}/{playedCharacterId}/{playedFloorId}/{runNumber}/{floorNumber}
     * @param {string} videoId - the video ID
     * @param {number} submissionId - the ID of the submission
     * @param {number} insertAfterEventId - the ID of the event after which the new one should be inserted
     * @param {number} playedCharacterId - the ID of the played character who will get the new event
     * @param {number} playedFloorId - the ID of the floor the event will go to
     * @param {number} runNumber - the number of the run in the submission
     * @param {number} floorNumber - the floornumber
     */
    insertGameplayEvent: function (videoId, submissionId, insertAfterEventId, playedCharacterId, playedFloorId, runNumber, floorNumber) {
        return `/Admin/InsertGameplayEvent/${videoId}/${submissionId.toString(10)}/${insertAfterEventId.toString(10)}/${playedCharacterId.toString(10)}/${playedFloorId.toString(10)}/${runNumber.toString(10)}/${floorNumber.toString(10)}`
    },


    /**
     * /Admin/DeleteEvent/{videoId}/{submissionId}/{eventId}
     * @param {string} videoId - the ID of the video
     * @param {number} submissionId - the ID of the submission
     * @param {number} eventId - the ID of the event that should be deleted
     */
    deleteEvent: function (videoId, submissionId, eventId) {
        return `/Admin/DeleteEvent/${videoId}/${submissionId.toString(10)}/${eventId.toString(10)}`;
    },


    /**
     * /Admin/DeleteSubmission/{id}
     * @param {number} id - the ID of the submission
     * @param {string} videoId - the ID of the vide
     */
    deleteSubmission: function (id, videoId) {
        return `/Admin/DeleteSubmission/${id.toString(10)}/${videoId}`;
    },


    /**
     * /Admin/TransformationsOverview
     */
    transformationsOverview: function () {
        return `/Admin/TransformationsOverview`;
    },

    /**
     * /Admin/EditTransformation/{id}
     * @param {string} id - the transformation ID
     */
    editTransformation: function (id) {
        return `/Admin/EditTransformation/${id}`;
    },

    /**
     * /Admin/DeleteTransformationItem/{id}
     * @param {string} transformationId - the id of the transformation
     * @param {string} itemId - the id of the isaac resource that should no longer be part of this transformation
     */
    deleteTransformationItem: function(transformationId, itemId) {
        return `/Admin/DeleteTransformationItem/${transformationId}/${itemId}`;
    },

    /**
     * /Admin/ValidateSubmissions
     */
    validateSubmissions: function() {
        return `/Admin/ValidateSubmissions`;
    }
};


export {
    AdminLink
}

