export interface IMenuItem {
  name: string
  icon: string
  children?: IMenuItem[]
}

export const menuList: IMenuItem[] = [
  {
    name: 'ts',
    icon: 'bicycle',
    children: [{
      name: 'type',
      icon: 'location',
      children: [{
        name: 'extends',
        icon: 'location'
      }]
    }]
  }, {
    name: 'vue3',
    icon: 'bicycle',
    children: [{
      name: 'transition',
      icon: 'location',
      children: [{
        name: 'animation',
        icon: 'location'
      }, {
        name: 'fade',
        icon: 'location'
      }, {
        name: 'group',
        icon: 'location'
      }, {
        name: 'state',
        icon: 'location'
      }, {
        name: 'provide',
        icon: 'location'
      }]
    }, {
      name: 'props',
      icon: 'location',
      children: [{
        name: 'provide',
        icon: 'location'
      }]
    }, {
      name: 'directive',
      icon: 'location',
      children: [{
        name: 'drag',
        icon: 'location'
      }]
    }]
  }, {
    name: 'echarts',
    icon: 'bicycle',
    children: [{
      name: 'pieChart',
      icon: 'location',
      children: [{
        name: 'chart',
        icon: 'location'
      }]
    }]
  }, {
    name: 'cesium',
    icon: 'bicycle',
    children: [{
      name: 'weather',
      icon: 'location',
      children: [{
        name: 'fog',
        icon: 'location'
      }, {
        name: 'rain',
        icon: 'location'
      }, {
        name: 'snow',
        icon: 'location'
      }]
    }, {
      name: 'command',
      icon: 'location'
    }, {
      name: 'demo',
      icon: 'location'
    }, {
      name: 'cesium-s',
      icon: 'location'
    }]
  }, {
    name: 'konva',
    icon: 'bicycle',
    children: [{
      name: 'wcs',
      icon: 'location',
      children: [{
        name: 'group',
        icon: 'location'
      }]
    }]
  }, {
    name: 'webgl',
    icon: 'bicycle',
    children: [{
      name: 'p1',
      icon: 'location',
      children: [{
        name: 'l1',
        icon: 'location'
      }, {
        name: 'l2',
        icon: 'location'
      }, {
        name: 'l3',
        icon: 'location'
      }]
    }]
  }, {
    name: 'openlayers',
    icon: 'bicycle',
    children: [{
      name: 'p1',
      icon: 'location',
      children: [{
        name: 'line',
        icon: 'location'
      }]
    }]
  }, {
    name: 'fabric',
    icon: 'bicycle',
    children: [{
      name: 'index',
      icon: 'location'
    }]
  }, {
    name: 'mapbox',
    icon: 'bicycle',
    children: [{
      name: 'customLayer',
      icon: 'location'
    }, {
      name: 'marker',
      icon: 'location'
    }, {
      name: 'layer',
      icon: 'location'
    }]
  }, {
    name: 'maptest',
    icon: 'bicycle',
    children: [{
      name: 'initMap',
      icon: 'location'
    }, {
      name: 'polarMap',
      icon: 'location'
    }]
  }
]