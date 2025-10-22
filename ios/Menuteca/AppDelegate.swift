import Expo
import React
import ReactAppDependencyProvider

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    print("🚀 AppDelegate: didFinishLaunchingWithOptions called")

    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    print("🚀 AppDelegate: Starting React Native with module: main")
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
    print("🚀 AppDelegate: React Native started successfully")
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    let url = bridge.bundleURL ?? bundleURL()
    print("🔗 ReactNativeDelegate: sourceURL = \(url?.absoluteString ?? "nil")")
    return url
  }

  override func bundleURL() -> URL? {
#if DEBUG
    print("🔧 ReactNativeDelegate: DEBUG mode - using Metro bundler")
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    let url = Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    print("🔧 ReactNativeDelegate: RELEASE mode - bundle URL = \(url?.absoluteString ?? "nil")")
    if url == nil {
      print("❌ ReactNativeDelegate: main.jsbundle NOT FOUND in app bundle!")
    }
    return url
#endif
  }
}
