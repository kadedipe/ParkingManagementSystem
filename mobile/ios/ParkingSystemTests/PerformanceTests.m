// ============================================================================
// PerformanceTests.m
// ============================================================================

#import <XCTest/XCTest.h>
#import <UIKit/UIKit.h>

@interface PerformanceTests : XCTestCase

@end

@implementation PerformanceTests

- (void)setUp {
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}

/**
 * Test performance of view rendering
 */
- (void)testViewRenderingPerformance {
    [self measureBlock:^{
        for (int i = 0; i < 100; i++) {
            UIView *view = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 100, 100)];
            view.backgroundColor = [UIColor redColor];
            [view layoutIfNeeded];
        }
    }];
}

/**
 * Test performance of image loading
 */
- (void)testImageLoadingPerformance {
    [self measureBlock:^{
        for (int i = 0; i < 10; i++) {
            UIImage *image = [UIImage imageNamed:@"AppIcon"];
            [image drawAtPoint:CGPointZero];
        }
    }];
}

/**
 * Test performance of data processing
 */
- (void)testDataProcessingPerformance {
    [self measureBlock:^{
        NSMutableArray *data = [NSMutableArray array];
        for (int i = 0; i < 10000; i++) {
            [data addObject:@(i)];
        }
        
        NSArray *sorted = [data sortedArrayUsingComparator:^NSComparisonResult(id obj1, id obj2) {
            return [obj1 compare:obj2];
        }];
    }];
}

@end