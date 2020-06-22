//
//  ShareViewController.m
//  share-intent
//
//  Created by ENT CGI on 16/04/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "ShareViewController.h"
#import "RNFileShareIntent.h"
#import <React/RCTRootView.h>
#import <React/RCTBundleURLProvider.h>
   
@implementation ShareViewController

- (void) loadView { 
  [RNFileShareIntent setContext: self.extensionContext];
      
  NSURL *jsCodeLocation;

  #if DEBUG
    jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.intent" fallbackResource:nil];
  #else
    jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"share" withExtension:@"jsbundle"];
  #endif

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                       moduleName:@"Share"
                                               initialProperties:nil
                                                   launchOptions:nil];
    
  rootView.backgroundColor = nil;
  self.view = rootView;
}

@end

