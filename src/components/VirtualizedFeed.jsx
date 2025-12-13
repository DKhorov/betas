import { memo, useRef, useCallback, useEffect, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import { Box } from '@mui/material';

/**
 * VirtualizedFeed Component
 * 
 * Implements virtual scrolling for the posts feed using react-window's VariableSizeList.
 * Only renders visible items to maintain performance with large lists.
 * 
 * Features:
 * - Dynamic height calculation for variable content
 * - Scroll position persistence
 * - Overscan configuration for smooth scrolling
 * - Supports 1000+ items with minimal DOM nodes
 */
const VirtualizedFeed = memo(({ 
  items, 
  renderItem, 
  estimatedItemSize = 400,
  overscanCount = 3,
  height = '100vh',
  width = '100%',
  onLoadMore,
  hasMore = false,
  scrollPositionKey = 'feed-scroll-position'
}) => {
  const listRef = useRef(null);
  const itemHeightsRef = useRef({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Get item height from cache or use estimated size
  const getItemSize = useCallback((index) => {
    return itemHeightsRef.current[index] || estimatedItemSize;
  }, [estimatedItemSize]);

  // Set item height and reset cache for that item
  const setItemSize = useCallback((index, size) => {
    if (itemHeightsRef.current[index] !== size) {
      itemHeightsRef.current[index] = size;
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  }, []);

  // Restore scroll position on mount
  useEffect(() => {
    if (!isInitialized && listRef.current && items.length > 0) {
      const savedPosition = sessionStorage.getItem(scrollPositionKey);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        listRef.current.scrollTo(position);
      }
      setIsInitialized(true);
    }
  }, [isInitialized, items.length, scrollPositionKey]);

  // Save scroll position on scroll
  const handleScroll = useCallback(({ scrollOffset }) => {
    sessionStorage.setItem(scrollPositionKey, scrollOffset.toString());
  }, [scrollPositionKey]);

  // Handle scroll for infinite loading
  const handleItemsRendered = useCallback(({ visibleStopIndex }) => {
    if (hasMore && onLoadMore && visibleStopIndex >= items.length - 5) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore, items.length]);

  // Row renderer
  const Row = useCallback(({ index, style }) => {
    const item = items[index];
    const rowRef = useRef(null);

    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height;
        setItemSize(index, height);
      }
    }, [index]);

    return (
      <div style={style}>
        <div ref={rowRef}>
          {renderItem(item, index)}
        </div>
      </div>
    );
  }, [items, renderItem, setItemSize]);

  if (items.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width, height }}>
      <List
        ref={listRef}
        height={typeof height === 'string' ? window.innerHeight : height}
        itemCount={items.length}
        itemSize={getItemSize}
        width={typeof width === 'string' ? '100%' : width}
        overscanCount={overscanCount}
        onScroll={handleScroll}
        onItemsRendered={handleItemsRendered}
        itemKey={(index) => items[index]._id || items[index].id || index}
      >
        {Row}
      </List>
    </Box>
  );
});

VirtualizedFeed.displayName = 'VirtualizedFeed';

export default VirtualizedFeed;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
