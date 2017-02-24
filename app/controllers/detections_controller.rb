class DetectionsController < ApplicationController
  def create
    client = Aws::Rekognition::Client.new
    resp = client.detect_labels(
      image: { bytes: File.read('/Users/marianserna/Downloads/Bot.png') }
    )
    labels = resp.labels.map { |label| label.name }
    render json: {labels: labels}
  end
end
