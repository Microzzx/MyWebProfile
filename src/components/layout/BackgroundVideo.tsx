type Props = React.HTMLAttributes<HTMLElement>;

const BackgroundVideo = ({ className, ...rest }: Props) => {
  return (
    <div className={`fixed inset-0 -z-10 w-full ${className ?? ""}`} {...rest}>
      <video className="h-full w-full object-cover object-top" autoPlay loop muted playsInline>
        <source src="/videos/Sequence.mp4" type="video/mp4" />
      </video>
      <div className="theme-backdrop absolute inset-0" />
    </div>
  );
};

export default BackgroundVideo;
