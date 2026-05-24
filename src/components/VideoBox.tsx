type Props = React.HTMLAttributes<HTMLElement>;

const VideoBox = ({ className, ...rest }: Props) => {
  return (
    <div className={`fixed inset-0 -z-10 w-full ${className ?? ""}`} {...rest}>
      <video className="h-full w-full object-cover" autoPlay loop muted playsInline>
        <source src="/videos/Sequence.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-zinc-950/65" />
    </div>
  );
};

export default VideoBox;
