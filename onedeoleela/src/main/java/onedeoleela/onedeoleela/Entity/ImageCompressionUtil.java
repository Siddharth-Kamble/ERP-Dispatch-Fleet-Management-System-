package onedeoleela.onedeoleela.Entity;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.Iterator;

public class ImageCompressionUtil {

    public static byte[] compressImage(byte[] imageBytes, float quality)
            throws IOException {

        ByteArrayInputStream bis = new ByteArrayInputStream(imageBytes);
        BufferedImage originalImage = ImageIO.read(bis);

        if (originalImage == null) {
            throw new IOException("Invalid image file");
        }

        // 🔥 Convert to RGB (removes alpha channel if exists)
        BufferedImage rgbImage = new BufferedImage(
                originalImage.getWidth(),
                originalImage.getHeight(),
                BufferedImage.TYPE_INT_RGB
        );

        Graphics2D g = rgbImage.createGraphics();
        g.setColor(Color.WHITE); // Background for transparent PNG
        g.fillRect(0, 0, rgbImage.getWidth(), rgbImage.getHeight());
        g.drawImage(originalImage, 0, 0, null);
        g.dispose();

        ByteArrayOutputStream bos = new ByteArrayOutputStream();

        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");

        if (!writers.hasNext()) {
            throw new IllegalStateException("No JPEG writers available");
        }

        ImageWriter writer = writers.next();
        ImageOutputStream ios = ImageIO.createImageOutputStream(bos);
        writer.setOutput(ios);

        ImageWriteParam param = writer.getDefaultWriteParam();

        if (param.canWriteCompressed()) {
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(quality); // 0.0 - 1.0
        }

        writer.write(null, new IIOImage(rgbImage, null, null), param);

        ios.close();
        writer.dispose();

        return bos.toByteArray();
    }
}