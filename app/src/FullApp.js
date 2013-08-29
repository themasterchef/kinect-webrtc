/*jslint browser: true, vars: true */
define([
    "src/DepthMap",
    "src/GuiControls",
    "src/RtcConnection",
    "src/World",
    "underscore",
    "mocap"
], function (DepthMap, GuiControls, RtcConnection, World, _, Mocap) {
    "use strict";
    
    var gui = new GuiControls();
    var conn = new RtcConnection();
    
    var addVideoStream = function (scene, video) {
        video.addEventListener("loadedmetadata", function (event) {
            var dmap = DepthMap.create(video);
            
            gui.addMesh(dmap);
            
            scene.add(dmap);
        }, false);
        
        video.play();
    };
    
    var addRtcVideoStream = function (scene) {
        
        var video = document.createElement("video");
        conn.getLocalVideo(video);
        addVideoStream(scene, video);
    };
    
    var start = function () {
        // Set up the 3D world
        var world = new World();
        
        // Wire up our skeleton data source
        // Always need a...
        var bcaster = new Mocap.Broadcaster();

        // SSE data source, with custom URL
        var source = new Mocap.ServerSentEventsSource(bcaster, "http://localhost:80/skeleton");
        
        source.start();
        
        // Last things
        // Add the local video source to the scene
        addRtcVideoStream(world.scene);
        // Rig up to add remote sources to the scene as they arrive
        conn.vent.remoteStreamAdded.add(function (video) {
            addVideoStream(world.scene, video);
        });
        conn.startRemoteListener();

        world.start();
    };
    
    return {
        start: start
    };
});
