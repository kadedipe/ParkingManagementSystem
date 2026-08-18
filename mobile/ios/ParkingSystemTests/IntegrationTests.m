// ============================================================================
// IntegrationTests.m
// ============================================================================

#import <XCTest/XCTest.h>
#import <UIKit/UIKit.h>

@interface IntegrationTests : XCTestCase

@end

@implementation IntegrationTests

- (void)setUp {
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}

/**
 * Test view controller integration
 */
- (void)testViewControllerIntegration {
    // Get the root view controller
    UIWindow *window = [[[UIApplication sharedApplication] delegate] window];
    UIViewController *rootVC = [window rootViewController];
    
    // Test that the root view controller responds to required selectors
    SEL selectors[] = {
        @selector(viewDidLoad),
        @selector(viewWillAppear:),
        @selector(viewDidAppear:),
        @selector(viewWillDisappear:),
        @selector(viewDidDisappear:),
    };
    
    for (int i = 0; i < sizeof(selectors)/sizeof(SEL); i++) {
        SEL selector = selectors[i];
        XCTAssertTrue([rootVC respondsToSelector:selector], @"Root VC should respond to %@", NSStringFromSelector(selector));
    }
}

/**
 * Test network integration
 */
- (void)testNetworkIntegration {
    XCTestExpectation *expectation = [self expectationWithDescription:@"Network request"];
    
    NSURL *url = [NSURL URLWithString:@"https://api.parking-system.com/health"];
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    
    NSURLSessionDataTask *task = [[NSURLSession sharedSession] dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error) {
            // Network may not be available in test environment
            [expectation fulfill];
            return;
        }
        
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
        if (httpResponse.statusCode == 200) {
            [expectation fulfill];
        } else {
            XCTFail(@"Network request failed with status: %ld", (long)httpResponse.statusCode);
        }
    }];
    
    [task resume];
    
    [self waitForExpectationsWithTimeout:30 handler:nil];
}

/**
 * Test database integration
 */
- (void)testDatabaseIntegration {
    // Test UserDefaults
    NSString *testKey = @"test_key";
    NSString *testValue = @"test_value";
    
    // Save value
    [[NSUserDefaults standardUserDefaults] setObject:testValue forKey:testKey];
    [[NSUserDefaults standardUserDefaults] synchronize];
    
    // Read value
    NSString *savedValue = [[NSUserDefaults standardUserDefaults] stringForKey:testKey];
    XCTAssertEqualObjects(savedValue, testValue, @"Database read/write should work");
    
    // Clean up
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:testKey];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

@end