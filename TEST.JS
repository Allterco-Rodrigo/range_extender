let deviceSSIDPrefix = 'ShellyPlugUS';
let ssidRE;
//let internetSSID = "Romulus";
//let internetPassword = "Alpaca.Lemonade!3.Wendigo!76";
let internetSSID = "FAMHQ";
let internetPassword = "r1h9n7m7";

let device0,device1,device2,device3,device4,device5,device6,device7,device8,device9;

// 1 - Scan network for SSID
function provisionRangeExtender() {
//    console.log("provisionRangeExtender");
    Shelly.call(
        "Wifi.GetConfig",
        {  },
        function(result,ec,em) {
            ssidRE = JSON.stringify(result.ap.ssid);
        }
      );
      
    Shelly.call(
        "Wifi.Scan",
        {  },
        function(result,ec,em) {
//            console.log(JSON.stringify(result),ec,em);
            getShellySSID(result.results);        
        }
    );  
};

// 2 - Get broadcasting SSID that starts with the defined prefix

function getShellySSID(listAP) {
//    console.log("getShellySSID");
    let shellyList = [];
    for(let a=0; a < listAP.length; a++){
//        console.log(listAP[a].ssid.slice(0,deviceSSIDPrefix.length),deviceSSIDPrefix)
        if(listAP[a].ssid.slice(0,deviceSSIDPrefix.length) === deviceSSIDPrefix){
            shellyList.push(listAP[a].ssid);
        }
    }
    if(shellyList.length > 0){        
        console.log(shellyList.length,"devices to provision");

        if(shellyList[0])
            device0 = shellyList[0];
        if(shellyList[1])
            device1 = shellyList[1];
        if(shellyList[2])
            device2 = shellyList[2];
        if(shellyList[3])
            device3 = shellyList[3];
        if(shellyList[4])
            device4 = shellyList[4];
        if(shellyList[5])
            device5 = shellyList[5];
        if(shellyList[6])
            device6 = shellyList[6];
        if(shellyList[7])
            device7 = shellyList[7];
        if(shellyList[8])
            device8 = shellyList[8];
        if(shellyList[9])
            device9 = shellyList[9];

        let scene = [
            {
                delay: 30000,
                fn: function () {
                    connectToTargetDevice(device0)
                },
            },
            // {
            //     delay: 30000,
            //     fn: function () {
            //         setTargetDeviceWifi()
            //     },
            // },
            {
                delay: 30000,
                fn: function () {
                    updateTargetDevice()
                },
            },
//--------------------------------------------------------
            {
                delay: 30000,
                fn: function () {
                    connectToTargetDevice(device1)
                },
            },
            // {
            //     delay: 30000,
            //     fn: function () {
            //         setTargetDeviceWifi()
            //     },
            // },
            {
                delay: 30000,
                fn: function () {
                    updateTargetDevice()
                },
            },
//--------------------------------------------------------
            {
                delay: 30000,
                fn: function () {
                    connectToTargetDevice(device2)
                },
            },
            // {
            //     delay: 30000,
            //     fn: function () {
            //         setTargetDeviceWifi()
            //     },
            // },
            {
                delay: 30000,
                fn: function () {
                    updateTargetDevice()
                },
            },
//--------------------------------------------------------
            {
                delay: 1000,
                fn: function () {
                    connectToTargetDevice(device3)
                },
            },
            {
                delay: 1000,
                fn: function () {
                    connectToTargetDevice(device4)
                },
            },
            {
                delay: 1000,
                fn: function () {
                    connectToTargetDevice(device5)
                },
            },
            {
                delay: 1000,
                fn: function () {
                    connectToTargetDevice(device6)
                },
            },
            {
                delay: 1000,
                fn: function () {
                    connectToTargetDevice(device7)
                },
            },
            {
                delay: 1000,
                fn: function () {
                    connectToTargetDevice(device8)
                },
            },
            {
                delay: 1000,
                fn: function () {
                    connectToTargetDevice(device9)
                },
            },
//--------------------------------------------------------            
            {
                fn: function () {
                    reconnectREToInternet();
                }
            },
        ];

        let scenePlayer = {
            currentScene: null,
            sceneCounter: -1,
            sceneTimer: null,
            loop: false,
            play: function (scene, loop) {
              if (typeof loop !== "undefined") {
                this.loop = loop;
              }
              Timer.clear(this.sceneTimer);
              this.sceneCounter = -1;
              this.currentScene = scene;
              this.next();
            },
            next: function () {
              if (!this.currentScene) {
                return;
              }
              this.sceneCounter++;
              let delay = 1;
              if (this.sceneCounter === this.currentScene.length) {
                if (this.loop) {
                  this.sceneCounter = -1;
                  this.step(delay);
                }
                return;
              }
              if (
                this.currentScene[this.sceneCounter].type === "cond" &&
                !this.currentScene[this.sceneCounter].fn()
              ) {
                return;
              }
              this.currentScene[this.sceneCounter].fn();
              if (typeof this.currentScene[this.sceneCounter].delay !== "undefined") {
                delay = this.currentScene[this.sceneCounter].delay;
              }
              this.step(delay);
            },
            step: function (delay) {
              this.sceneTimer = Timer.set(
                delay,
                false,
                function (sp) {
                  sp.next();
                },
                this
              );
            },
            cancel: function () {
              Timer.clear(this.sceneTimer);
              this.sceneCounter = -1;
              this.currentScene = null;
            },
          };

        scenePlayer.play(scene, false);
    } else {
        console.log("No devices to provision");
    }      
  };

// Connect to a target device
  
function connectToTargetDevice(ssidTarget){
    if(!ssidTarget){
        return
    }
    Shelly.call(
    "Wifi.SetConfig",
    { config: { sta1: { ssid: ssidTarget, pass: "", enable: true } } },
    function(result,ec,em) {
        console.log(JSON.stringify(result),ec,em);
        console.log("Connected to Target");
    },
  );
}

// Set target device's wifi to connect to the Range Extender

function setTargetDeviceWifi(){
    let endpoint = 'http://192.168.33.1/rpc/WiFi.SetConfig?config={"sta":{"ssid":"' + ssidRE + '","pass":""}}"';
    Shelly.call(
        "HTTP.GET",
        { url: endpoint },
        function(result,ec,em) {
//            console.log(JSON.stringify(result),ec,em);
            console.log("Device provisioned");
        }
    )
}

function updateTargetDevice(){
    let endpoint = 'http://192.168.33.1/rpc/Shelly.Update';
    Shelly.call(
        "HTTP.GET",
        { url: endpoint },
        function(result,ec,em) {
            console.log(JSON.stringify(result),ec,em);
            console.log("Device Updated");
        }
    )
}


function reconnectREToInternet(){
    let connectParam = '{"sta":{"ssid":"'+ internetSSID +'", "pass":"'+ internetPassword +'", "enable":true}}"';
    Shelly.call(
    "Wifi.SetConfig",
    { config: connectParam },
    function(result,ec,em) {
        console.log(JSON.stringify(result),ec,em);
        console.log("Device Reconnected");
    }
  );
}


provisionRangeExtender();