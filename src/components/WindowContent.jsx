import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

const WindowContent = ({ content, contentType }) => {
  const contentRef = useRef(null);

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.includes('youtube.com') 
      ? url.split('v=')[1].split('&')[0]
      : url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getPinterestPinId = (url) => {
    const matches = url.match(/(?:https?:\/\/)?(?:www\.)?(?:pinterest\.com\/pin\/|pin\.it\/)(\d+)/);
    return matches ? matches[1] : null;
  };

  useEffect(() => {
    // Load Twitter widget script
    if (content.includes('twitter.com') || content.includes('class="twitter-tweet"')) {
      const script = document.createElement('script');
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }

    // Load Reddit widget script
    if (content.includes('class="reddit-embed-bq"')) {
      const script = document.createElement('script');
      script.src = "https://embed.reddit.com/widgets.js";
      script.async = true;
      script.charset = "UTF-8";
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [content]);

  useEffect(() => {
    // Trigger Reddit embed rendering
    if (content.includes('class="reddit-embed-bq"') && window.rembeddit) {
      window.rembeddit.render();
    }
  }, [content]);

  if (content.includes('pinterest.com/pin/') || content.includes('pin.it/')) {
    const pinId = getPinterestPinId(content);
    if (pinId) {
      return (
        <iframe
          src={`https://assets.pinterest.com/ext/embed.html?id=${pinId}`}
          height="550"
          width="100%"
          frameBorder="0"
          scrolling="no"
          title="Pinterest Embed"
          style={{ maxWidth: '100%', minWidth: '230px' }}
        />
      );
    } else {
      return (
        <div>
          <p>Unable to embed Pinterest content. Please visit the link directly:</p>
          <a href={content} target="_blank" rel="noopener noreferrer">{content}</a>
        </div>
      );
    }
  }

  if (content.includes('class="reddit-embed-bq"')) {
    return (
      <div 
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
      />
    );
  }

  if (content.startsWith('reddit-embed:')) {
    const embedCode = content.slice(13);
    return (
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          overflow: 'auto',
          position: 'relative',
          paddingBottom: '56.25%',
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(embedCode) }} />
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }

  if (content.includes('youtube.com') || content.includes('youtu.be')) {
    const embedUrl = getYouTubeEmbedUrl(content);
    return (
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    );
  } else if (content.startsWith('http://') || content.startsWith('https://')) {
    if (content.endsWith('.pdf') || contentType === 'pdf') {
      return (
        <iframe
          src={content}
          width="100%"
          height="100%"
          frameBorder="0"
          title="PDF Viewer"
        />
      );
    }
    return (
      <iframe src={content} width="100%" height="100%" frameBorder="0" title="External content" />
    );
  } else if (contentType === 'image' || content.startsWith('data:image')) {
    return (
      <div className="image-container" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <img 
          src={content} 
          alt="Imported" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%',
          }} 
        />
      </div>
    );
  } else if (contentType === 'pdf' || (content.startsWith('data:application/pdf') || content.startsWith('blob:'))) {
    return (
      <iframe
        src={content}
        width="100%"
        height="100%"
        frameBorder="0"
        title="PDF Viewer"
      />
    );
  } else if (content.includes('twitter.com') || content.includes('class="twitter-tweet"')) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
      />
    );
  } else {
    return <div className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />;
  }
};

export default React.memo(WindowContent);
