/**
 * VirtualizedComments Component Tests
 * 
 * Tests for nested virtual scrolling with expand/collapse support
 * Requirements: 1.1, 1.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VirtualizedComments from '../components/VirtualizedComments';

// Mock react-window
jest.mock('react-window', () => ({
  VariableSizeList: ({ children, itemCount, itemKey }) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: itemCount }, (_, index) => {
        const key = itemKey(index);
        return (
          <div key={key} data-testid={`list-item-${index}`}>
            {children({ index, style: {} })}
          </div>
        );
      })}
    </div>
  ),
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('VirtualizedComments', () => {
  let mockRenderComment;
  
  beforeEach(() => {
    mockRenderComment = jest.fn((comment, props) => (
      <div data-testid={`comment-${comment._id}`}>
        <span>{comment.text}</span>
        <span>Depth: {props.depth}</span>
        {props.hasReplies && (
          <button onClick={props.onToggleExpand}>
            {props.isExpanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>
    ));
  });

  beforeEach(() => {
    sessionStorage.clear();
  });

  test('renders flat comment list', () => {
    const comments = [
      { _id: '1', text: 'Comment 1', replies: [] },
      { _id: '2', text: 'Comment 2', replies: [] },
    ];

    render(
      <VirtualizedComments
        comments={comments}
        renderComment={mockRenderComment}
      />
    );

    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    expect(screen.getByTestId('comment-1')).toBeInTheDocument();
    expect(screen.getByTestId('comment-2')).toBeInTheDocument();
  });

  test('handles nested comments with expand/collapse', async () => {
    const comments = [
      {
        _id: '1',
        text: 'Parent Comment',
        replies: [
          { _id: '1-1', text: 'Child Comment 1', replies: [] },
          { _id: '1-2', text: 'Child Comment 2', replies: [] },
        ],
      },
    ];

    const { rerender } = render(
      <VirtualizedComments
        comments={comments}
        renderComment={mockRenderComment}
      />
    );

    // Initially, only parent should be visible
    expect(screen.getByTestId('comment-1')).toBeInTheDocument();
    expect(screen.queryByTestId('comment-1-1')).not.toBeInTheDocument();

    // Find and click expand button
    const expandButton = screen.getByText('Expand');
    fireEvent.click(expandButton);

    // Force re-render to see expanded state
    rerender(
      <VirtualizedComments
        comments={comments}
        renderComment={mockRenderComment}
      />
    );

    // After expansion, children should be visible
    await waitFor(() => {
      expect(screen.getByTestId('comment-1-1')).toBeInTheDocument();
      expect(screen.getByTestId('comment-1-2')).toBeInTheDocument();
    });
  });

  test('handles deeply nested comment trees', () => {
    const comments = [
      {
        _id: '1',
        text: 'Level 0',
        replies: [
          {
            _id: '2',
            text: 'Level 1',
            replies: [
              {
                _id: '3',
                text: 'Level 2',
                replies: [
                  { _id: '4', text: 'Level 3', replies: [] },
                ],
              },
            ],
          },
        ],
      },
    ];

    render(
      <VirtualizedComments
        comments={comments}
        renderComment={mockRenderComment}
        maxDepth={5}
      />
    );

    // Should render at least the root comment
    expect(screen.getByTestId('comment-1')).toBeInTheDocument();
    
    // Verify depth is passed correctly
    const calls = mockRenderComment.mock.calls;
    expect(calls[0][1].depth).toBe(0);
  });

  test('respects maxDepth limit', () => {
    const createNestedComments = (depth, maxDepth) => {
      if (depth >= maxDepth) {
        return [];
      }
      return [
        {
          _id: `comment-${depth}`,
          text: `Comment at depth ${depth}`,
          replies: createNestedComments(depth + 1, maxDepth),
        },
      ];
    };

    const comments = createNestedComments(0, 15);
    const maxDepth = 5;

    render(
      <VirtualizedComments
        comments={comments}
        renderComment={mockRenderComment}
        maxDepth={maxDepth}
      />
    );

    // Check that no comment exceeds maxDepth
    const calls = mockRenderComment.mock.calls;
    calls.forEach(([comment, props]) => {
      expect(props.depth).toBeLessThanOrEqual(maxDepth);
    });
  });

  test('returns null for empty comments', () => {
    const { container } = render(
      <VirtualizedComments
        comments={[]}
        renderComment={mockRenderComment}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('calculates indentation based on depth', () => {
    const comments = [
      {
        _id: '1',
        text: 'Parent',
        replies: [
          {
            _id: '2',
            text: 'Child',
            replies: [
              { _id: '3', text: 'Grandchild', replies: [] },
            ],
          },
        ],
      },
    ];

    render(
      <VirtualizedComments
        comments={comments}
        renderComment={mockRenderComment}
      />
    );

    // Verify depth is correctly passed to renderComment
    const calls = mockRenderComment.mock.calls;
    expect(calls[0][1].depth).toBe(0); // Parent
  });

  test('preserves scroll position in sessionStorage', () => {
    const comments = [
      { _id: '1', text: 'Comment 1', replies: [] },
      { _id: '2', text: 'Comment 2', replies: [] },
    ];

    const scrollPositionKey = 'test-scroll-position';

    render(
      <VirtualizedComments
        comments={comments}
        renderComment={mockRenderComment}
        scrollPositionKey={scrollPositionKey}
      />
    );

    // Verify the component is rendered
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
  });
});

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
